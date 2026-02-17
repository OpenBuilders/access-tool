import asyncio
import logging
from typing import Any

from aiogram import Bot
from aiogram.types import ChatInviteLink
from aiogram.exceptions import TelegramRetryAfter
from aiogram.client.default import DefaultBotProperties

from community_manager.settings import community_manager_settings

logger = logging.getLogger(__name__)


class TelegramBotApiService:
    def __init__(self) -> None:
        self.token = community_manager_settings.telegram_bot_token
        # Use AiohttpSession if we need specific config, but default is fine.
        # We can implement middleware here if needed.
        self.bot = Bot(
            token=self.token, default=DefaultBotProperties(parse_mode="MarkdownV2")
        )

    async def _safe_request(self, func, *args, **kwargs) -> Any:
        """
        Wraps a request with basic retry logic for 429s.
        Ideally this should be a middleware, but for simple service calls this works.
        """
        try:
            return await func(*args, **kwargs)
        except TelegramRetryAfter as e:
            logger.warning(f"Rate limited. Sleeping for {e.retry_after} seconds.")
            await asyncio.sleep(e.retry_after)
            return await func(*args, **kwargs)
        except Exception as e:
            logger.error(f"BotAPI Error: {e}", exc_info=True)
            raise e
        finally:
            # We should close the session if we are creating a new bot instance every time.
            # However, for efficiency, we might want to keep the session alive.
            # But since this runs in a Celery worker (likely prefork), managing session lifecycle is tricky.
            # Aiogram 3.x manages session automatically with context managers, but we are using it as a service.
            # Let's verify session closure.
            await self.bot.session.close()

    async def kick_chat_member(self, chat_id: int | str, user_id: int) -> bool:
        """
        Kicks a user from a chat (bans and then unbans to allow rejoining).
        """
        logger.info(f"Kicking user {user_id} from chat {chat_id}")
        # Ban to remove
        banned = await self._safe_request(
            self.bot.ban_chat_member, chat_id=chat_id, user_id=user_id
        )
        # Unban to allow rejoining (classic 'kick')
        unbanned = await self._safe_request(
            self.bot.unban_chat_member, chat_id=chat_id, user_id=user_id
        )
        return banned and unbanned

    async def unban_chat_member(self, chat_id: int | str, user_id: int) -> bool:
        """
        Unbans a user from a chat (allows them to join again).
        """
        logger.info(f"Unbanning user {user_id} from chat {chat_id}")
        return await self._safe_request(
            self.bot.unban_chat_member, chat_id=chat_id, user_id=user_id
        )

    async def send_message(
        self, chat_id: int | str, text: str, reply_markup: Any = None
    ) -> Any:
        """
        Sends a text message to a chat with optional reply markup.
        """
        logger.info(f"Sending message to chat {chat_id}: {text[:50]}...")
        return await self._safe_request(
            self.bot.send_message, chat_id=chat_id, text=text, reply_markup=reply_markup
        )

    async def create_chat_invite_link(
        self,
        chat_id: int | str,
        name: str | None = "Access Tool Invite Link",
        expire_date: int | None = None,
        member_limit: int | None = None,
    ) -> ChatInviteLink:
        """
        Creates a new invite link.
        """
        logger.info(f"Creating invite link for chat {chat_id}")
        return await self._safe_request(
            self.bot.create_chat_invite_link,
            chat_id=chat_id,
            name=name,
            expire_date=expire_date,
            member_limit=member_limit,
            creates_join_request=True,
        )

    async def revoke_chat_invite_link(
        self, chat_id: int | str, invite_link: str
    ) -> ChatInviteLink:
        """
        Revokes an invite link.
        """
        logger.info(f"Revoking invite link {invite_link} for chat {chat_id}")
        return await self._safe_request(
            self.bot.revoke_chat_invite_link, chat_id=chat_id, invite_link=invite_link
        )
