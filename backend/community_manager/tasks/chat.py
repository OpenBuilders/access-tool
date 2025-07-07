from asgiref.sync import async_to_sync
from celery.utils.log import get_task_logger

from community_manager.actions.chat import (
    CommunityManagerTaskChatAction,
    CommunityManagerChatAction,
)
from community_manager.celery_app import app
from community_manager.entrypoint import init_client
from community_manager.settings import community_manager_settings
from core.actions.chat.rule.whitelist import (
    TelegramChatWhitelistExternalSourceContentAction,
)
from core.constants import (
    CELERY_SYSTEM_QUEUE_NAME,
)
from core.services.db import DBService

logger = get_task_logger(__name__)


async def run_sanity_checks() -> None:
    """
    Separate function to ensure that the telethon client is initiated in the same event loop
    """
    service = init_client()
    with DBService().db_session() as db_session:
        action = CommunityManagerTaskChatAction(db_session)
        await action.sanity_chat_checks(service.client)
        logger.info("Chat sanity checks completed.")


@app.task(
    name="check-chat-members",
    queue=CELERY_SYSTEM_QUEUE_NAME,
    ignore_result=True,
)
def check_chat_members() -> None:
    if not community_manager_settings.enable_manager:
        logger.warning("Community manager is disabled.")
        return

    async_to_sync(run_sanity_checks)()
    logger.info("Chat members checked.")


async def refresh_chat_external_sources_async() -> None:
    with DBService().db_session() as db_session:
        action = TelegramChatWhitelistExternalSourceContentAction(db_session)
        # Celery tasks are not async, so we need to run the async function in a blocking way
        await action.refresh_enabled()
        logger.info("Chat external sources refreshed.")


@app.task(
    name="refresh-chat-external-sources",
    queue=CELERY_SYSTEM_QUEUE_NAME,
    rate_limit="1/m",
    ignore_result=True,
)
def refresh_chat_external_sources() -> None:
    if not community_manager_settings.enable_manager:
        logger.warning("Community manager is disabled.")
        return

    async_to_sync(refresh_chat_external_sources_async)()
    logger.info("Chat external sources refreshed.")


async def refresh_all_chats_async() -> None:
    """
    Separate function to ensure that the telethon client is initiated in the same event loop
    """
    with DBService().db_session() as db_session:
        action = CommunityManagerChatAction(db_session)
        await action.refresh_all()
        logger.info("Chats refreshed successfully..")


@app.task(
    name="refresh-chats",
    queue=CELERY_SYSTEM_QUEUE_NAME,
    ignore_result=True,
)
def refresh_chats() -> None:
    if not community_manager_settings.enable_manager:
        logger.warning("Community manager is disabled.")
        return

    async_to_sync(refresh_all_chats_async)()
    logger.info("Chats refreshed.")
