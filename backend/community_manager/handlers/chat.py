import logging

from sqlalchemy.exc import NoResultFound
from telethon import events

from core.actions.authorization import AuthorizationAction
from core.actions.chat import TelegramChatAction
from core.dtos.chat import TelegramChatDTO
from core.dtos.user import TelegramUserDTO
from core.services.chat import TelegramChatService
from core.services.chat.user import TelegramChatUserService
from core.services.db import DBService
from core.utils.events import ChatJoinRequestEventBuilder, ChatAdminChangeEventBuilder

logger = logging.getLogger(__name__)


__all__ = [
    "handle_chat_action",
    "handle_join_request",
    "handle_chat_participant_update",
]


async def handle_chat_action(event: events.ChatAction.Event):
    with DBService().db_session() as session:
        telegram_chat_service = TelegramChatService(session)
        if not telegram_chat_service.check_exists(event.chat_id):
            logger.debug(
                "Chat doesn't exist, but bot was not added to the chat: %d. Skipping",
            )
            return

        if event.new_photo:
            # Photo was deleted
            if not event.photo:
                telegram_chat_service.clear_logo(chat_id=event.chat_id)
                return

            telegram_chat_action = TelegramChatAction(
                session, telethon_client=event.client
            )
            await telegram_chat_action.fetch_and_push_profile_photo(event.chat)
            return

        logger.debug(
            f"Chat action: {event.chat_id=!r} {event.user_id=!r} {event.action_message=!r}",
            extra={"event": event},
        )

        if not any(
            [event.user_joined, event.user_added, event.user_left, event.user_kicked]
        ):
            # To avoid handling other chat actions as they are not supported
            logger.debug(f"Unhandled chat action: {event!r}. Skipping.")
            return

        elif event.action_message:
            # To avoid handling multiple events twice (users are added or removed and the action message is sent)
            # The only message that should be handled is when bot is added to the chat
            logger.debug(
                f"Chat action message {event!r} is not handled, but was removed."
            )
            return

        elif event.user.bot and not event.user.is_self:
            logger.debug(f"Other bot user {event.user.id!r} is not handled.")
            return

        authorization_action = AuthorizationAction(
            session, telethon_client=event.client
        )

        if event.user_joined or event.user_added:
            if event.added_by and event.added_by.is_self:
                # Do not handle actions made by the bot
                logger.debug(
                    f"Action made by the bot {event.added_by.id!r}. Already handled."
                )
                return

            elif event.user.is_self:
                logger.info(
                    f"Bot was added to chat: {event.chat_id=!r}",
                )
                return

            logger.info(
                f"New chat member: {event.chat_id=!r} {event.user=!r}",
                extra={"event": event},
            )
            await authorization_action.on_chat_member_in(
                chat_id=event.chat_id,
                user=TelegramUserDTO.from_telethon_user(event.user),
            )

        elif event.user_left or event.user_kicked:
            if event.kicked_by and event.kicked_by.is_self:
                # Do not handle actions made by the bot
                logger.debug(f"Action made by the bot {event.kicked_by.id!r}.")
                return

            if event.user.is_self:
                logger.warning(
                    f"Bot was kicked from chat: {event.chat_id=!r}",
                    extra={"event": event},
                )
                await authorization_action.on_bot_kicked(chat_id=event.chat_id)
                return

            logger.info(
                f"Chat member left/kicked: {event.chat_id=!r} {event.user=!r}",
                extra={"event": event},
            )
            await authorization_action.on_chat_member_out(
                chat_id=event.chat_id,
                user=TelegramUserDTO.from_telethon_user(event.user),
            )

        else:
            logger.info(f"Unhandled chat action: {event!r}")


async def handle_join_request(event: ChatJoinRequestEventBuilder.Event):
    logger.info(
        f"New join request: {event.chat_id=!r} {event.user_id=!r}",
    )
    with DBService().db_session() as session:
        authorization_action = AuthorizationAction(
            session, telethon_client=event.client
        )
        await authorization_action.on_join_request(
            telegram_user_id=event.user_id,
            chat_id=event.chat_id,
            invited_by_bot=event.invited_by_current_user,
        )


async def handle_chat_participant_update(
    event: ChatAdminChangeEventBuilder.Event,
) -> None:
    """Does not handle kicks from the chat"""
    # Chat ID received from the event is not prefixed with -100 for channels,
    #  so we need to prefix it if needed
    chat_id = int(
        f"-100{event.original_update.channel_id}"
        if event.original_update.channel_id > 0
        else event.original_update.channel_id
    )
    with DBService().db_session() as session:
        telegram_chat_service = TelegramChatService(session)
        chat: TelegramChatDTO
        try:
            chat = TelegramChatDTO.from_object(telegram_chat_service.get(chat_id))
            # Handle bot updates only if chat existed previously
            if event.is_self:
                logger.info(
                    "Bot user %d is managed in the chat %d: %s",
                    event.user.id,
                    chat_id,
                    event.new_participant,
                )
                if not event.sufficient_bot_privileges:
                    if not chat.insufficient_privileges:
                        logger.warning(
                            "Insufficient permissions for the bot in chat %d", chat_id
                        )
                        telegram_chat_service.set_insufficient_privileges(
                            chat_id=chat_id, value=True
                        )
                else:
                    if chat.insufficient_privileges:
                        logger.info(
                            "Sufficient permissions for the bot in chat %d", chat_id
                        )
                        telegram_chat_service.set_insufficient_privileges(
                            chat_id=chat_id, value=False
                        )
                return

        except NoResultFound:
            # Otherwise create a new chat if bot privileges are sufficient for this
            logger.info(
                f"Chat {chat_id!r} doesn't exist, but bot was added with admin rights. Creating..."
            )
            # If bot is able to see that update, it means it was promoted to admins
            #  at some point, so the chat should be created in the database
            if event.sufficient_bot_privileges:
                telegram_chat_action = TelegramChatAction(
                    session, telethon_client=event.client
                )
                await telegram_chat_action.create(
                    chat_id,
                    sufficient_bot_privileges=event.sufficient_bot_privileges,
                )

        logger.debug("Handling chat participant update %s", event)

        if (target_user_entity := event.user) and target_user_entity.bot:
            logger.debug(f"Bot user {target_user_entity.id!r} is not handled.")
            return

        telegram_chat_user_service = TelegramChatUserService(db_session=session)

        try:
            target_user = telegram_chat_user_service.get(
                chat_id=chat_id, user_id=target_user_entity.id
            )

            if event.is_demoted:
                logger.info(
                    "Admin %d demoted in chat %d", target_user_entity.id, chat_id
                )
                if target_user.is_admin:
                    telegram_chat_user_service.demote_admin(
                        chat_id=chat_id, user_id=target_user.user_id
                    )
                return

            elif event.is_promoted:
                logger.info(
                    "Admin %d promoted in chat %d", target_user_entity.id, chat_id
                )
                if not target_user.is_admin:
                    telegram_chat_user_service.promote_admin(
                        chat_id=chat_id, user_id=target_user.user_id
                    )
                return
        except NoResultFound:
            telegram_chat_user_service.create(
                chat_id=chat_id,
                user_id=target_user_entity.id,
                is_admin=bool(getattr(event.new_participant, "admin_rights", None)),
                is_managed=False,
            )
