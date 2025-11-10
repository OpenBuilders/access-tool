import datetime
import logging
from pathlib import Path
from typing import AsyncGenerator

from sqlalchemy.orm import Session

from core.actions.base import BaseAction
from core.constants import GIFT_COLLECTIONS_METADATA_KEY
from core.models.gift import GiftUnique, GiftCollection
from core.services.gift.collection import GiftCollectionService
from core.services.gift.item import GiftUniqueService
from core.services.superredis import RedisService
from indexer_gifts.indexers.item import GiftUniqueIndexer
from indexer_gifts.settings import gifts_indexer_settings

logger = logging.getLogger(__name__)


class IndexerGiftUniqueAction(BaseAction):
    def __init__(self, db_session: Session, session_path: Path) -> None:
        super().__init__(db_session)
        self.collection_service = GiftCollectionService(db_session)
        self.service = GiftUniqueService(db_session)
        self.redis_service = RedisService()
        self.indexer = GiftUniqueIndexer(session_path=session_path)

    async def index_all(self) -> AsyncGenerator[set[int], None]:
        """
        Indexes all unique items in the database.
        """
        logger.info("Starting indexing all unique items...")
        for collection in self.collection_service.get_all(
            slugs=gifts_indexer_settings.whitelisted_gift_collections
        ):
            yield await self._index(collection, start=1, stop=collection.upgraded_count)
        logger.info("Finished indexing all unique items.")

    async def _index(
        self, collection: GiftCollection, start: int | None, stop: int | None
    ) -> set[int]:
        """
        Indexes and processes a collection of unique items while managing creation,
        updates, and targeted owners.
        This function interacts with a database to synchronize the collection data
        and updates Redis caching as necessary.


        :param collection: The gift collection object to be indexed.
        :param start: The starting index for the indexing process. Defaults to 1.
        :param stop: The ending index for the indexing process. Defaults to the number of upgraded items.
        :return: A set of Telegram owner IDs that require targeted actions due to
                 ownership changes or updates.
        """
        if start is None:
            start = 1

        if stop is None:
            stop = collection.upgraded_count

        existing_items = {
            item.slug: item
            for item in self.service.get_all(
                collection_slug=collection.slug,
                number_ge=start,
                number_le=stop,
            )
        }
        logger.info(
            f"Found existing {len(existing_items)} unique items "
            f"for collection {collection.slug!r} and starting from index {start} to {stop}..."
        )
        targeted_telegram_owner_ids = set()

        # Iterate over batches and process items
        async for batch in self.indexer.index_collection_items(
            collection_slug=collection.slug,
            start=start,
            stop=stop,
        ):
            to_create = []
            to_update = []
            for item in batch:
                if existing_item := existing_items.get(item.slug):
                    # Update record only if necessary
                    if any(
                        (
                            item.telegram_owner_id != existing_item.telegram_owner_id,
                            item.owner_address != existing_item.owner_address,
                        )
                    ):
                        # Ignore if the owner was previously hidden
                        if isinstance(existing_item.telegram_owner_id, int):
                            # Store Telegram ID of the previous owner to perform and actions on losing ownership if needed
                            targeted_telegram_owner_ids.add(
                                existing_item.telegram_owner_id
                            )
                        to_update.append(
                            {
                                "slug": item.slug,
                                "telegram_owner_id": item.telegram_owner_id,
                                "owner_address": item.owner_address,
                                "blockchain_address": item.blockchain_address,
                                "last_updated": datetime.datetime.now(tz=datetime.UTC),
                            }
                        )
                    else:
                        logger.debug(
                            f"No changes detected for item {item.slug!r} in collection {collection.slug!r}. Skipping."
                        )
                else:
                    to_create.append(
                        GiftUnique(
                            slug=item.slug,
                            collection_slug=collection.slug,
                            model=item.model,
                            backdrop=item.backdrop,
                            number=item.number,
                            pattern=item.pattern,
                            telegram_owner_id=item.telegram_owner_id,
                            owner_address=item.owner_address,
                            blockchain_address=item.blockchain_address,
                            last_updated=datetime.datetime.now(tz=datetime.UTC),
                        )
                    )
            if to_create:
                # Cache has to be cleared as new metadata could appear.
                # It could be extended to clear only when new metadata options appear.
                self.redis_service.delete(GIFT_COLLECTIONS_METADATA_KEY)

            self.db_session.bulk_save_objects(to_create)
            logger.info(
                f"Created {len(to_create)} new unique items for collection {collection.slug!r}."
            )
            self.db_session.bulk_update_mappings(GiftUnique, to_update)
            logger.info(
                f"Updated {len(to_update)} existing unique items for collection {collection.slug!r}."
            )
            self.db_session.commit()

        return targeted_telegram_owner_ids

    async def index(
        self, slug: str, start: int | None = None, stop: int | None = None
    ) -> set[int]:
        """
        Processes a collection of items by indexing, updating, or creating unique records. It also
        tracks and returns Telegram IDs of previous owners of updated items for further actions.

        :param slug: A unique identifier for the collection being processed.
        :param start: The starting index for the indexing process. Defaults to 1.
        :param stop: The ending index for the indexing process. Defaults to the number of upgraded items.

        :return: A set of Telegram IDs corresponding to previous owners of the updated
                 items who need further actions.
        """
        collection = self.collection_service.get(slug)
        return await self._index(collection, start=start, stop=stop)
