import asyncio

from celery.utils.log import get_task_logger
from telethon.errors import PhoneNumberBannedError, AuthKeyDuplicatedError

from core.constants import (
    UPDATED_GIFT_USER_IDS,
    CELERY_GIFT_FETCH_QUEUE_NAME,
    DEFAULT_CELERY_TASK_RETRY_DELAY,
    DEFAULT_CELERY_TASK_MAX_RETRIES,
    DEFAULT_TELEGRAM_TASK_BATCH_PROCESSING_SIZE,
)
from core.dtos.gift.collection import GiftCollectionDTO
from core.exceptions.gift import GiftCollectionNotExistsError
from core.services.db import DBService
from core.services.gift.collection import GiftCollectionService
from core.utils.session import SessionLockManager, SessionUnavailableError
from indexer_gifts.actions.collection import IndexerGiftCollectionAction
from indexer_gifts.actions.item import IndexerGiftUniqueAction
from indexer_gifts.celery_app import app
from indexer_gifts.settings import gifts_indexer_settings

logger = get_task_logger(__name__)


async def index_whitelisted_gift_collections() -> list[GiftCollectionDTO]:
    """
    Asynchronously indexes whitelisted gift collections in the database. This function checks for any
    gift collections that are whitelisted but missing from the database and attempts to index them.
    It also ensures that the database lock related to the indexing process is released after execution.

    :return: A list of `GiftCollectionDTO` objects representing the gift collections retrieved
        and indexed from the database.
    """
    with DBService().db_session() as db_session:
        gift_collection_service = GiftCollectionService(db_session)
        collections = gift_collection_service.get_all(
            slugs=gifts_indexer_settings.whitelisted_gift_collections,
        )

        collections_dtos = [GiftCollectionDTO.from_orm(c) for c in collections]
        with SessionLockManager(
            gifts_indexer_settings.telegram_indexer_session_path
        ) as session_path:
            collection_action = IndexerGiftCollectionAction(
                db_session, session_path=session_path
            )
            try:
                for slug in gifts_indexer_settings.whitelisted_gift_collections:
                    try:
                        new_collection = await collection_action.index(slug)
                        collections_dtos.append(new_collection)
                        logger.info(
                            f"Whitelisted gift collection {slug!r} indexed successfully."
                        )
                    except GiftCollectionNotExistsError as e:
                        logger.error(f"Failed to index gift collection {slug!r}: {e}")
            except (PhoneNumberBannedError, AuthKeyDuplicatedError) as e:
                # Rename session to mark as dirty
                session_path.rename(f"{session_path}-dirty")
                raise e

        return collections_dtos


async def index_gift_collection_ownerships(
    slug: str, start: int | None, stop: int | None
) -> None:
    """
    Indexes gift ownership data for a specified collection by processing
    unique gift actions related to the given collection slug. After indexing,
    updated user identifiers are logged, and certain identifiers are stored
    within a Redis set for further processing.

    :param slug: The slug that uniquely identifies the gift collection whose
                 ownership data is being indexed.
    :param start: The starting index for processing unique gift actions.
    :param stop: The ending index for processing unique gift actions.
    """
    with DBService().db_session() as db_session:
        with SessionLockManager(
            gifts_indexer_settings.telegram_indexer_session_path
        ) as session_path:
            action = IndexerGiftUniqueAction(db_session, session_path=session_path)
            try:
                batch_telegram_ids = await action.index(
                    slug=slug, start=start, stop=stop
                )
                logger.info(
                    f"Indexed {len(batch_telegram_ids)} unique gift actions for collection {slug!r}."
                )
            except (PhoneNumberBannedError, AuthKeyDuplicatedError) as e:
                # Rename session to mark as dirty
                session_path.rename(f"{session_path}-dirty")
                raise e

            if batch_telegram_ids:
                logger.info(f"Updated user IDs count: {len(batch_telegram_ids)}")
                action.redis_service.add_to_set(
                    UPDATED_GIFT_USER_IDS, *batch_telegram_ids
                )

        logger.info(f"Gift ownerships for collection {slug!r} indexed.")


@app.task(
    name="fetch-gift-collection-ownership-details",
    queue=CELERY_GIFT_FETCH_QUEUE_NAME,
    default_retry_delay=DEFAULT_CELERY_TASK_RETRY_DELAY,
    autoretry_for=(
        SessionUnavailableError,
        PhoneNumberBannedError,
        AuthKeyDuplicatedError,
    ),
    retry_kwargs={"max_retries": DEFAULT_CELERY_TASK_MAX_RETRIES},
    ignore_result=True,
)
def fetch_gift_collection_ownership_details(
    slug: str, start: int | None = None, stop: int | None = None
) -> None:
    logger.info(
        f"Received task to index collection {slug!r} ownership details. Start ID: {start}, Stop ID: {stop}"
    )
    asyncio.run(index_gift_collection_ownerships(slug, start=start, stop=stop))


@app.task(
    name="fetch-gift-ownership-details",
    queue=CELERY_GIFT_FETCH_QUEUE_NAME,
    default_retry_delay=DEFAULT_CELERY_TASK_RETRY_DELAY,
    autoretry_for=(
        SessionUnavailableError,
        PhoneNumberBannedError,
        AuthKeyDuplicatedError,
    ),
    retry_kwargs={"max_retries": DEFAULT_CELERY_TASK_MAX_RETRIES},
    ignore_result=True,
)
def fetch_gift_ownership_details():
    """
    Fetch details of gift ownership for each gift collection in a whitelisted list.

    This task fetches ownership details for gift collections by dividing
    the processing into batches of a predefined size.
    It uses the Celery task queue system and works in conjunction with the function that fetches
    ownership details for each batch.

    The function runs asynchronously to index whitelisted gift collections
    and iterates through these collections to process their ownership details.
    It dispatches separate tasks for each batch of upgraded items within the
    collections.
    Tasks will be retried automatically on session or phone-number-related errors
     up to a maximum defined limit.
    """
    collections = asyncio.run(index_whitelisted_gift_collections())
    for collection in collections:
        for i in range(
            1, collection.upgraded_count, DEFAULT_TELEGRAM_TASK_BATCH_PROCESSING_SIZE
        ):
            app.send_task(
                "fetch-gift-collection-ownership-details",
                args=(
                    collection.slug,
                    i,
                    min(
                        i + DEFAULT_TELEGRAM_TASK_BATCH_PROCESSING_SIZE,
                        collection.upgraded_count,
                    ),
                ),
                queue=CELERY_GIFT_FETCH_QUEUE_NAME,
            )
