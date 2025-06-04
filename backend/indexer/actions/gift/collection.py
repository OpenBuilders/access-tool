import logging

from sqlalchemy.orm import Session

from core.actions.base import BaseAction
from core.constants import GIFT_COLLECTIONS_METADATA_KEY
from core.dtos.gift.collection import GiftCollectionDTO
from core.exceptions.gift import GiftCollectionAlreadyExistsError
from core.services.gift.collection import GiftCollectionService
from core.services.superredis import RedisService
from indexer.indexers.gift.collection import GiftCollectionIndexer


logger = logging.getLogger(__name__)


class IndexerGiftCollectionAction(BaseAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session)
        self.service = GiftCollectionService(db_session)
        self.indexer = GiftCollectionIndexer()
        self.redis_service = RedisService()

    async def index(self, slug: str) -> GiftCollectionDTO:
        if self.service.find(slug):
            logger.warning(
                f"Gift Collection with slug {slug!r} already exists. Skipping indexing."
            )
            raise GiftCollectionAlreadyExistsError(
                f"Gift Collection with slug {slug!r} already exists."
            )

        gift_collection_dto = await self.indexer.index(slug)
        gift_collection = self.service.create(
            slug=gift_collection_dto.slug,
            title=gift_collection_dto.title,
            preview_url=gift_collection_dto.preview_url,
            supply=gift_collection_dto.supply,
            upgraded_count=gift_collection_dto.upgraded_count,
        )
        logger.info(f"Created gift collection {gift_collection.slug!r} successfully.")
        # Reset the metadata cache as new items appear
        self.redis_service.delete(GIFT_COLLECTIONS_METADATA_KEY)
        # To ensure that the DB lock is released
        await self.indexer.telethon_service.stop()
        return GiftCollectionDTO.from_orm(gift_collection)
