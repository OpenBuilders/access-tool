import asyncio
import logging

from sqlalchemy.orm import Session

from core.constants import UPDATED_GIFT_USER_IDS, CELERY_GIFT_FETCH_QUEUE_NAME
from core.dtos.gift.collection import GiftCollectionDTO
from core.exceptions.gift import GiftCollectionNotExistsError
from core.services.db import DBService
from core.services.gift.collection import GiftCollectionService
from indexer.actions.gift.collection import IndexerGiftCollectionAction
from indexer.actions.gift.item import IndexerGiftUniqueAction
from indexer.celery_app import app
from indexer.settings import indexer_settings
from indexer.utils.session import SessionLockManager

logger = logging.getLogger(__name__)


async def index_whitelisted_gift_collections(
    db_session: Session,
) -> list[GiftCollectionDTO]:
    """
    Asynchronously indexes whitelisted gift collections in the database. This function checks for any
    gift collections that are whitelisted but missing from the database and attempts to index them.
    It also ensures that the database lock related to the indexing process is released after execution.

    :param db_session: A database session used to perform operations on the gift collections.
    :return: A list of `GiftCollectionDTO` objects representing the gift collections retrieved
        and indexed from the database.
    """
    gift_collection_service = GiftCollectionService(db_session)
    collections = gift_collection_service.get_all()

    missing_collections = set(indexer_settings.whitelisted_gift_collections) - set(
        c.slug for c in collections
    )
    if missing_collections:
        with SessionLockManager(
            indexer_settings.telegram_indexer_session_path
        ) as session_path:
            collection_action = IndexerGiftCollectionAction(
                db_session, session_path=session_path
            )
            logger.warning(
                f"Missing whitelisted gift collections: {missing_collections}. Indexing them now."
            )
            for slug in missing_collections:
                try:
                    await collection_action.index(slug)
                except GiftCollectionNotExistsError as e:
                    logger.error(f"Failed to index gift collection {slug}: {e}")

    return [GiftCollectionDTO.from_orm(c) for c in collections]


async def index_gift_collections() -> list[GiftCollectionDTO]:
    """
    Indexes and retrieves a list of gift collections that have been whitelisted
    from the database.

    This function establishes a database session using the DBService, interacts
    with the database to fetch whitelisted gift collections, and returns the
    retrieved list.
    It operates asynchronously to support non-blocking functionality.

    :return: A list of whitelisted gift collections, represented as
             instances of `GiftCollectionDTO`.
    """
    with DBService().db_session() as db_session:
        result = await index_whitelisted_gift_collections(db_session)
        return result


async def index_gift_collection_ownerships(slug: str) -> None:
    """
    Indexes gift ownership data for a specified collection by processing
    unique gift actions related to the given collection slug. After indexing,
    updated user identifiers are logged, and certain identifiers are stored
    within a Redis set for further processing.

    :param slug: The slug that uniquely identifies the gift collection whose
                 ownership data is being indexed.
    """
    with DBService().db_session() as db_session:
        with SessionLockManager(
            indexer_settings.telegram_indexer_session_path
        ) as session_path:
            action = IndexerGiftUniqueAction(db_session, session_path=session_path)
            batch_telegram_ids = await action.index(slug=slug)
            if batch_telegram_ids:
                logger.info(f"Updated user IDs count: {len(batch_telegram_ids)}")
                action.redis_service.add_to_set(
                    UPDATED_GIFT_USER_IDS, *batch_telegram_ids
                )

        logger.info(f"Gift ownerships for collection {slug!r} indexed.")


@app.task(
    name="fetch-gift-collection-ownership-details",
    queue=CELERY_GIFT_FETCH_QUEUE_NAME,
)
def fetch_gift_collection_ownership_details(slug: str):
    asyncio.run(index_gift_collection_ownerships(slug))


@app.task(
    name="fetch-gift-ownership-details",
    queue=CELERY_GIFT_FETCH_QUEUE_NAME,
)
def fetch_gift_ownership_details():
    collections = asyncio.run(index_gift_collections())
    for collection in collections:
        app.send_task(
            "fetch-gift-collection-ownership-details",
            args=(collection.slug,),
            queue=CELERY_GIFT_FETCH_QUEUE_NAME,
        )
