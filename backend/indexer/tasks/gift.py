import asyncio
import logging

from sqlalchemy.orm import Session

from core.constants import UPDATED_GIFT_USER_IDS
from core.exceptions.gift import GiftCollectionNotExistsError
from core.services.db import DBService
from indexer.actions.gift.collection import IndexerGiftCollectionAction
from indexer.actions.gift.item import IndexerGiftUniqueAction
from indexer.celery_app import app
from indexer.settings import indexer_settings

logger = logging.getLogger(__name__)


async def index_whitelisted_gift_collections(db_session: Session) -> None:
    """
    Indexes whitelisted gift collections by verifying existing entries in the database
    and indexing the ones that are missing.
    This function ensures that any whitelisted gift collection not present in the database is indexed.
    Logs warnings for missing collections and handles errors if collections cannot be indexed.
    Additionally, it ensures proper cleanup of resources by stopping the telethon service.

    BE AWARE: This function will not remove the previously indexed collections from the database
     if they are no longer whitelisted

    :param db_session: The database session that used for querying and managing database
                       interactions.
    """
    collection_action = IndexerGiftCollectionAction(db_session)
    collections = collection_action.service.get_all()

    missing_collections = set(indexer_settings.whitelisted_gift_collections) - set(
        c.slug for c in collections
    )
    if missing_collections:
        logger.warning(
            f"Missing whitelisted gift collections: {missing_collections}. Indexing them now."
        )
        for slug in missing_collections:
            try:
                await collection_action.index(slug)
            except GiftCollectionNotExistsError as e:
                logger.error(f"Failed to index gift collection {slug}: {e}")

    # To ensure that the DB lock is released
    await collection_action.indexer.telethon_service.stop()


async def index_gift_ownerships() -> None:
    """
    Indexes and updates the gift ownerships in the database and Redis cache.

    This function initializes a database session and indexes gift collections that are
    whitelisted.
    It uses an asynchronous process to batch-process the indexing of all gift
    ownerships.
    For each batch that is processed:
    - If the batch is empty, logs that no gift ownership changes were found.
    - If the batch contains data, updates the Redis cache with the user IDs.

    Once all batches are processed and indexed, a summary log confirms the operation.

    :raises Exception: If issues occur during the database session or indexing of gift ownerships.

    :return: This asynchronous function does not return a value.
    """
    with DBService().db_session() as db_session:
        await index_whitelisted_gift_collections(db_session)
        action = IndexerGiftUniqueAction(db_session)
        async for batch in action.index_all():
            if not batch:
                logger.info("No gift ownerships changes found.")
                continue

            action.redis_service.add_to_set(UPDATED_GIFT_USER_IDS, *batch)
            logger.info(f"Updated user IDs count: {len(batch)}")

        logger.info("Gift ownerships indexed.")


@app.task(name="fetch-gift-ownership-details")
def fetch_gift_ownership_details():
    asyncio.run(index_gift_ownerships())
