import asyncio

from celery.utils.log import get_task_logger

from community_manager.celery_app import app
from community_manager.entrypoint import init_client
from community_manager.settings import community_manager_settings
from core.actions.authorization import AuthorizationAction
from core.actions.chat import TelegramChatAction
from core.actions.chat.rule.whitelist import (
    TelegramChatWhitelistExternalSourceContentAction,
)
from core.constants import (
    CELERY_SYSTEM_QUEUE_NAME,
    UPDATED_WALLETS_SET_NAME,
)
from core.services.chat.user import TelegramChatUserService
from core.services.db import DBService
from core.services.superredis import RedisService

logger = get_task_logger(__name__)


async def sanity_chat_checks(wallets: list[str] | None) -> None:
    logger.info(f"Validating chat members for {wallets}")
    with DBService().db_session() as db_session:
        telegram_chat_user_service = TelegramChatUserService(db_session)
        chat_members = telegram_chat_user_service.get_all_by_linked_wallet(
            addresses=wallets
        )

        if not chat_members:
            logger.info("No chats to validate. Skipping")

        telethon_service = init_client()
        authorization_action = AuthorizationAction(
            db_session, telethon_client=telethon_service.client
        )
        await authorization_action.kick_ineligible_chat_members(
            chat_members=chat_members
        )


@app.task(
    name="check-chat-members",
    queue=CELERY_SYSTEM_QUEUE_NAME,
)
def check_chat_members() -> None:
    if not community_manager_settings.enable_manager:
        logger.warning("Community manager is disabled.")
        return

    redis_service = RedisService()
    wallets = redis_service.pop_from_set(
        name=UPDATED_WALLETS_SET_NAME,
        count=community_manager_settings.items_per_task,
    )
    if isinstance(wallets, str):
        wallets = [wallets]

    if wallets:
        try:
            asyncio.run(sanity_chat_checks(wallets=wallets))
        except Exception as exc:
            # Add wallets back to the set to retry later
            logger.error(f"Failed to validate chat members: {exc}", exc_info=True)
            redis_service.add_to_set(UPDATED_WALLETS_SET_NAME, *wallets)
    else:
        logger.info("No users to validate. Skipping")


@app.task(
    name="refresh-chat-external-sources",
    queue=CELERY_SYSTEM_QUEUE_NAME,
    rate_limit="1/m",
)
def refresh_chat_external_sources() -> None:
    if not community_manager_settings.enable_manager:
        logger.warning("Community manager is disabled.")
        return

    with DBService().db_session() as db_session:
        action = TelegramChatWhitelistExternalSourceContentAction(db_session)
        # Celery tasks are not async, so we need to run the async function in a blocking way
        asyncio.run(action.refresh_enabled())
        logger.info("Chat external sources refreshed.")


async def refresh_all_chats_async() -> None:
    """
    Separate function to ensure that the telethon client is initiated in the same event loop
    """
    with DBService().db_session() as db_session:
        action = TelegramChatAction(db_session)
        await action.refresh_all()


@app.task(
    name="refresh-chats",
    queue=CELERY_SYSTEM_QUEUE_NAME,
)
def refresh_chats() -> None:
    if not community_manager_settings.enable_manager:
        logger.warning("Community manager is disabled.")
        return

    asyncio.run(refresh_all_chats_async())
    logger.info("Chats refreshed.")
