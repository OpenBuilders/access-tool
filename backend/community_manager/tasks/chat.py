from asgiref.sync import async_to_sync
from celery.utils.log import get_task_logger

from community_manager.actions.chat import (
    CommunityManagerTaskChatAction,
    CommunityManagerChatAction,
    CommunityManagerUserChatAction,
)
from community_manager.celery_app import app
from community_manager.entrypoint import init_client
from community_manager.settings import community_manager_settings
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


async def check_target_chat_members(chat_id: int) -> None:
    with DBService().db_session() as db_session:
        telethon_service = init_client()
        action = CommunityManagerUserChatAction(
            db_session, telethon_client=telethon_service.client
        )
        chat_members = await action.telegram_chat_user_service.get_all(
            chat_ids=[chat_id], with_wallet_details=True
        )
        logger.info(f"Found {len(chat_members)} chat members for chat {chat_id=!r}.")
        await action.kick_ineligible_chat_members(chat_members=chat_members)


@app.task(
    name="check-target-chat-members",
    queue=CELERY_SYSTEM_QUEUE_NAME,
    ignore_result=True,
)
def check_target_chat_members_task(chat_id: int) -> None:
    async_to_sync(check_target_chat_members)(chat_id)


async def refresh_chat_external_sources_async() -> None:
    with DBService().db_session() as db_session:
        telethon_service = init_client()
        action = CommunityManagerTaskChatAction(db_session)
        await action.refresh_external_sources(telethon_client=telethon_service.client)


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

    # async_to_sync(refresh_all_chats_async)()
    # logger.info("Chats refreshed.")


async def async_disable_chat(chat_id: int) -> None:
    with DBService().db_session() as db_session:
        action = CommunityManagerChatAction(db_session)
        await action.disable(chat_id)


@app.task(
    name="disable-chat",
    queue=CELERY_SYSTEM_QUEUE_NAME,
)
def disable_chat(chat_id: int) -> None:
    async_to_sync(async_disable_chat)(chat_id)


async def async_enable_chat(chat_id: int) -> None:
    with DBService().db_session() as db_session:
        action = CommunityManagerChatAction(db_session)
        await action.enable(chat_id)


@app.task(
    name="enable-chat",
    queue=CELERY_SYSTEM_QUEUE_NAME,
)
def enable_chat(chat_id: int) -> None:
    async_to_sync(async_enable_chat)(chat_id)
