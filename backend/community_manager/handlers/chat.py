import logging

from sqlalchemy.exc import NoResultFound
from telethon import events

from community_manager.actions.chat import CommunityManagerChatAction
from community_manager.events import (
    ChatJoinRequestEventBuilder,
    ChatAdminChangeEventBuilder,
)
from core.dtos.chat import TelegramChatDTO
from core.dtos.user import TelegramUserDTO
from core.services.chat import TelegramChatService
from core.services.db import DBService

logger = logging.getLogger(__name__)


__all__ = [
    "handle_chat_action",
    "handle_join_request",
    "handle_chat_participant_update",
]


async def handle_chat_action(event: events.ChatAction.Event):
    with DBService().db_session() as session:
        logger.info(
            f"Chat action: {event.chat_id=!r} {event.user_id=!r} {event.action_message=!r}",
            extra={"event": event},
        )

        telegram_chat_service = TelegramChatService(session)
        if not telegram_chat_service.check_exists(event.chat_id):
            logger.info(
                "Chat doesn't exist, but bot was not added to the chat: %d. Skipping event...",
                event.chat_id,
            )
            return
        # We no longer need this resource
        del telegram_chat_service

        telegram_chat_action = CommunityManagerChatAction(
            session, telethon_client=event.client
        )

        if event.new_photo:
            await telegram_chat_action.on_logo_update(
                chat=event.chat, photo=event.photo
            )

        elif event.new_title:
            await telegram_chat_action.on_title_update(
                chat_id=event.chat_id, new_title=event.new_title
            )

        # elif event.action_message:
        #     # To avoid handling multiple events twice (users are added or removed and the action message is sent)
        #     # The only message that should be handled is when bot is added to the chat
        #     logger.debug(f"Chat action message {event!r} is not handled.")
        #     return

        elif event.user.bot and not event.user.is_self:
            logger.info(f"Another bot user {event.user.id!r} is not handled.")
            return

        if event.user_joined or event.user_added:
            if event.added_by and event.added_by.is_self:
                # Do not handle actions made by the bot
                logger.info(
                    f"Action made by the bot {event.added_by.id!r}. Already handled."
                )
                return

            elif event.user.is_self:
                logger.info(
                    f"Bot was added to chat: {event.chat_id=!r}. Action is handled in another handler"
                )
                return

            logger.info(
                f"New chat member: {event.chat_id=!r} {event.user.id=!r}",
                extra={"event": event},
            )
            await telegram_chat_action.on_chat_member_in(
                chat_id=event.chat_id,
                user=TelegramUserDTO.from_telethon_user(event.user),
            )

        elif event.user_left or event.user_kicked:
            if event.user.is_self:
                logger.warning(
                    f"Bot was kicked from chat: {event.chat_id=!r}",
                    extra={"event": event},
                )
                await telegram_chat_action.on_bot_kicked(chat_id=event.chat_id)
                return

            if event.kicked_by and event.kicked_by.is_self:
                # Do not handle actions made by the bot
                logger.info(f"Action made by the bot {event.kicked_by.id!r}.")

            else:
                logger.info(
                    f"Chat member left/kicked: {event.chat_id=!r} {event.user_id=!r}",
                    extra={"event": event},
                )
                await telegram_chat_action.on_chat_member_out(
                    chat_id=event.chat_id,
                    user=TelegramUserDTO.from_telethon_user(event.user),
                )

        else:
            logger.info(f"Unhandled chat action: {event!r}")

    raise events.StopPropagation


async def handle_join_request(event: ChatJoinRequestEventBuilder.Event):
    logger.info(
        f"New join request: {event.chat_id=!r} {event.user_id=!r}",
    )
    with DBService().db_session() as session:
        telegram_chat_action = CommunityManagerChatAction(
            db_session=session, telethon_client=event.client
        )
        await telegram_chat_action.on_join_request(
            telegram_user_id=event.user_id,
            chat_id=event.chat_id,
            invited_by_bot=event.invited_by_current_user,
            invite_link=event.invite_link,
        )

    raise events.StopPropagation


async def handle_chat_participant_update(
    event: ChatAdminChangeEventBuilder.Event,
) -> None:
    """Does not handle kicks from the chat"""
    # Chat ID received from the event is not prefixed with -100 for channels,
    #  so we need to prefix it if needed
    logger.info(
        f"Chat action: {event.chat_id=!r} {event.original_update.stringify()=!r}",
        extra={"event": event},
    )
    chat_id = int(
        f"-100{event.original_update.channel_id}"
        if event.original_update.channel_id > 0
        else event.original_update.channel_id
    )
    with DBService().db_session() as session:
        telegram_chat_service = TelegramChatService(session)
        chat: TelegramChatDTO | None = None
        try:
            chat = TelegramChatDTO.from_object(telegram_chat_service.get(chat_id))
        except NoResultFound:
            pass

        telegram_chat_action = CommunityManagerChatAction(
            session, telethon_client=event.client
        )

        if not chat:
            # Create a chat if it didn't exist before
            await telegram_chat_action.create(chat_id=chat_id, event=event)

        elif event.is_self:
            # If chat exists and privileges of the current bot user were managed – react to these changes
            await telegram_chat_action.on_bot_chat_member_update(event=event, chat=chat)

        elif (target_telethon_user := event.user) and target_telethon_user.bot:
            # Ignore actions done on other bots
            logger.debug(f"Bot user {target_telethon_user.id!r} is not handled.")

        else:
            # Update an admin flag on another chat member if needed
            await telegram_chat_action.on_chat_member_update(event=event, chat=chat)

    raise events.StopPropagation
