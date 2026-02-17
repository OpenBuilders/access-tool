import asyncio
import json
import logging

from sqlalchemy.orm import sessionmaker, Session

from core.db import engine
from core.actions.user import UserAction
from core.services.chat.user import TelegramChatUserService
from core.dtos.user import TelegramUserDTO
from core.services.superredis import RedisService
from core.services.supertelethon import TelethonService
from core.constants import (
    CELERY_SYSTEM_QUEUE_NAME,
    CELERY_GATEWAY_INDEX_QUEUE_NAME,
)

from community_manager.celery_app import app
from community_manager.gateway.types import IndexChatCommand
from community_manager.utils import is_chat_participant_manager_admin

logger = logging.getLogger(__name__)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class TelegramGatewayService:
    def __init__(self, telethon_service: TelethonService) -> None:
        self.telethon_service = telethon_service
        self.redis_service = RedisService()
        self.queue_name = CELERY_GATEWAY_INDEX_QUEUE_NAME
        self.running = False

    async def start(self) -> None:
        """
        Starts the gateway service loop.
        """
        self.running = True
        logger.info("Starting Telegram Gateway Service...")
        while self.running:
            try:
                # BLPOP blocks until an item is available
                # returns tuple (queue_name, data)
                # timeout=1 to allow loop checking for self.running
                item = self.redis_service.blpop(self.queue_name, timeout=1)

                if item:
                    _, data = item
                    await self._process_command(data)

                # Yield control to allow other tasks (Telethon events) to run
                await asyncio.sleep(0.01)

            except Exception as e:
                logger.error(f"Error in Gateway loop: {e}", exc_info=True)
                await asyncio.sleep(1)

    async def _process_command(self, data: str | bytes) -> None:
        try:
            if isinstance(data, bytes):
                data = data.decode("utf-8")

            payload = json.loads(data)
            command_type = payload.get("command_type")

            logger.info(f"Received command: {command_type}")

            if command_type == "index_chat":
                command = IndexChatCommand(**payload)
                await self._handle_index_chat(command)
            else:
                logger.warning(f"Unknown command type: {command_type}")

        except Exception as e:
            logger.error(f"Failed to process command: {data} - {e}", exc_info=True)

    async def _handle_index_chat(self, command: IndexChatCommand) -> None:
        chat_id = command.chat_id
        logger.info(f"Indexing chat {chat_id}...")

        db_session: Session = SessionLocal()
        try:
            user_action = UserAction(db_session)
            telegram_chat_user_service = TelegramChatUserService(db_session)

            processed_user_ids = []
            count = 0

            # TODO: We might need to handle flood waits here if iteration is fast?
            # Telethon handles it internally mostly.

            async for participant_user in self.telethon_service.get_participants(
                chat_id
            ):
                if participant_user.bot:
                    continue

                try:
                    with db_session.begin_nested():
                        user = user_action.create_or_update(
                            TelegramUserDTO.from_telethon_user(participant_user)
                        )
                        telegram_chat_user_service.create_or_update(
                            chat_id=chat_id,
                            user_id=user.id,
                            is_admin=is_chat_participant_manager_admin(
                                participant_user.participant
                            ),
                            is_managed=False,
                        )
                    processed_user_ids.append(user.id)
                    count += 1
                except Exception as e:
                    logger.error(
                        f"Failed to process user {participant_user.id}: {e}",
                        exc_info=True,
                    )
                    # begin_nested() automatically rolls back the savepoint on exception

            if command.cleanup:
                telegram_chat_user_service.delete_stale_participants(
                    chat_id=chat_id, active_user_ids=processed_user_ids
                )

            db_session.commit()
            logger.info(f"Finished indexing chat {chat_id}. Found {count} members.")

            # Trigger validation of chat members after indexing is complete
            # This ensures that we check for eligibility once we have the latest data
            if command.cleanup:
                app.send_task(
                    "check-target-chat-members",
                    args=(chat_id,),
                    queue=CELERY_SYSTEM_QUEUE_NAME,
                )
                logger.info(
                    f"Triggered check-target-chat-members task for chat {chat_id}"
                )

        except Exception as e:
            logger.error(f"Error indexing chat {chat_id}: {e}", exc_info=True)
            db_session.rollback()
        finally:
            db_session.close()

    def stop(self) -> None:
        self.running = False
