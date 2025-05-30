from sqlalchemy.orm import Session

from core.actions.base import BaseAction
from core.constants import GIFT_COLLECTIONS_METADATA_KEY
from core.dtos.gift.collection import (
    GiftCollectionMetadataDTO,
    GiftCollectionsMetadataDTO,
)
from core.services.gift.collection import GiftCollectionService
from core.services.gift.item import GiftUniqueService
from core.services.superredis import RedisService
from core.utils.cache import cached_dto_result


class GiftUniqueAction(BaseAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session)
        self.collection_service = GiftCollectionService(db_session)
        self.service = GiftUniqueService(db_session)
        self.redis_service = RedisService()

    @cached_dto_result(
        cache_key=GIFT_COLLECTIONS_METADATA_KEY,
        response_model=GiftCollectionsMetadataDTO,
        cache_ttl=60 * 60 * 24,  # 1-day cache
    )
    def get_metadata(self) -> GiftCollectionsMetadataDTO:
        all_collections = self.collection_service.get_all()

        collections_with_options = []

        for collection in all_collections:
            options = self.service.get_unique_options(collection_slug=collection.slug)
            collections_with_options.append(
                GiftCollectionMetadataDTO(
                    slug=collection.slug,
                    title=collection.title,
                    preview_url=collection.preview_url,
                    supply=collection.supply,
                    upgraded_count=collection.upgraded_count,
                    models=options["models"],
                    backdrops=options["backdrops"],
                    patterns=options["patterns"],
                )
            )

        return GiftCollectionsMetadataDTO(collections=collections_with_options)
