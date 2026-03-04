import logging

from sqlalchemy.orm import Session

from core.constants import GIFT_COLLECTIONS_METADATA_KEY
from core.actions.base import BaseAction
from core.services.gift.collection import GiftCollectionService
from core.services.superredis import RedisService
from indexer_gifts.indexers.gift_changes import GiftChangesIndexer


logger = logging.getLogger(__name__)


class IndexerGiftChangesAction(BaseAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session)
        self.service = GiftCollectionService(db_session)
        self.indexer = GiftChangesIndexer()
        self.redis_service = RedisService()

    async def index_all(self) -> None:
        """
        Fetches all gift collections from the changes.tg API via `GiftChangesIndexer`
        and synchronizes them to the database using `GiftCollectionService`.
        Updates existing entries, and creates missing ones.
        """
        logger.info("Starting synchronization of gift collections from changes.tg API")

        try:
            collections_dtos = await self.indexer.fetch_all_collections()
        finally:
            await self.indexer.close()

        logger.info(
            f"Fetched {len(collections_dtos)} valid collections from changes.tg API"
        )

        for collection_dto in collections_dtos:
            parsed_id = int(collection_dto.id)

            existing_record = self.service.find(parsed_id)

            if not existing_record:
                gift_collection = self.service.create(
                    id=parsed_id,
                    title=collection_dto.title,
                    preview_url=collection_dto.preview_url,
                    supply=collection_dto.supply,  # defaults to 0 from the indexer
                    upgraded_count=collection_dto.upgraded_count,  # defaults to 0
                    options=collection_dto.options,
                )
                logger.info(
                    f"Created gift collection {gift_collection.title!r} ({gift_collection.id}) successfully."
                )
            else:
                logger.debug(
                    f"Gift collection {collection_dto.title!r} ({parsed_id}) already exists. Updating properties..."
                )
                # Re-use the existing supply and upgraded_count to prevent overwriting with 0
                gift_collection = self.service.update(
                    id=parsed_id,
                    title=collection_dto.title,
                    preview_url=collection_dto.preview_url,
                    supply=existing_record.supply,
                    upgraded_count=existing_record.upgraded_count,
                    options=collection_dto.options,
                )
                logger.info(
                    f"Updated gift collection {gift_collection.title!r} ({gift_collection.id}) successfully."
                )

        # Reset the metadata cache as new items/options appear
        self.redis_service.delete(GIFT_COLLECTIONS_METADATA_KEY)
        logger.info("Synchronization of gift collections finished successfully.")
