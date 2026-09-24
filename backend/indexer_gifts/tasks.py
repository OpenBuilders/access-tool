import asyncio
from celery.utils.log import get_task_logger

from core.constants import (
    CELERY_GIFT_COLLECTIONS_SYNC_QUEUE,
    CELERY_GIFT_USER_PRIORITY_QUEUE,
    CELERY_GIFT_USER_BATCH_QUEUE,
    DEFAULT_CELERY_TASK_RETRY_DELAY,
    DEFAULT_CELERY_TASK_MAX_RETRIES,
)
from core.services.db import DBService
from core.services.user import UserService
from indexer_gifts.actions.api import IndexerGiftChangesAction
from indexer_gifts.actions.user import IndexerUserGiftAction
from indexer_gifts.celery_app import app

logger = get_task_logger(__name__)

DEFAULT_USER_GIFT_BATCH_SIZE = 25


# === Flow A: Sync Collections ===
@app.task(
    name="sync-gift-collections-from-api",
    queue=CELERY_GIFT_COLLECTIONS_SYNC_QUEUE,
    default_retry_delay=DEFAULT_CELERY_TASK_RETRY_DELAY,
    retry_kwargs={"max_retries": DEFAULT_CELERY_TASK_MAX_RETRIES},
    ignore_result=True,
)
def sync_gift_collections_from_api() -> None:
    """
    Hourly scheduled task that fetches all gift collections from the `changes.tg` API
    and syncs them to the database.
    """
    with DBService().db_session() as db_session:
        action = IndexerGiftChangesAction(db_session=db_session)
        asyncio.run(action.index_all())


# === Flow B: Index User Gifts (High Priority Queue) ===
@app.task(
    name="index-user-gifts",
    queue=CELERY_GIFT_USER_PRIORITY_QUEUE,
    default_retry_delay=DEFAULT_CELERY_TASK_RETRY_DELAY,
    retry_kwargs={"max_retries": DEFAULT_CELERY_TASK_MAX_RETRIES},
)
def index_user_gifts(telegram_user_id: int) -> bool:
    with DBService().db_session() as db_session:
        action = IndexerUserGiftAction(db_session)
        asyncio.run(action.sync_user_gifts(telegram_user_id))
    return True


# === Flow C: Recurring Background User Gift Refresh (Batch Worker) ===
@app.task(
    name="refresh-users-gifts-batch",
    queue=CELERY_GIFT_USER_BATCH_QUEUE,
    default_retry_delay=DEFAULT_CELERY_TASK_RETRY_DELAY,
    retry_kwargs={"max_retries": DEFAULT_CELERY_TASK_MAX_RETRIES},
    ignore_result=True,
)
def refresh_users_gifts_batch(telegram_user_ids: list[int]) -> None:
    """Processes a chunk of 25 users in ~30-60 seconds."""
    with DBService().db_session() as db_session:
        action = IndexerUserGiftAction(db_session)
        existing_collection_ids = action.gift_collection_service.get_all_ids()

        for user_id in telegram_user_ids:
            try:
                asyncio.run(
                    action.sync_user_gifts(
                        user_id, existing_collection_ids=existing_collection_ids
                    )
                )
            except Exception as e:
                logger.error(f"Error refreshing gifts for user {user_id}: {e}")


# === Flow C: Master Dispatcher Task ===
@app.task(
    name="refresh-all-user-gifts",
    queue=CELERY_GIFT_USER_BATCH_QUEUE,
    ignore_result=True,
)
def refresh_all_user_gifts() -> None:
    """Master dispatcher: chunks all registered users and enqueues batch tasks."""
    with DBService().db_session() as db_session:
        user_service = UserService(db_session)
        all_telegram_ids = user_service.get_all_telegram_ids()

    if not all_telegram_ids:
        logger.info("No registered Telegram users found for gift refresh.")
        return

    logger.info(
        f"Dispatching gift refresh for {len(all_telegram_ids)} users in chunks of {DEFAULT_USER_GIFT_BATCH_SIZE}"
    )

    for i in range(0, len(all_telegram_ids), DEFAULT_USER_GIFT_BATCH_SIZE):
        chunk = all_telegram_ids[i : i + DEFAULT_USER_GIFT_BATCH_SIZE]
        app.send_task(
            "refresh-users-gifts-batch",
            args=(chunk,),
            queue=CELERY_GIFT_USER_BATCH_QUEUE,
        )
