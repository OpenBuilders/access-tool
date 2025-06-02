from typing import Sequence

from sqlalchemy import and_, or_, select, ColumnElement, distinct
from sqlalchemy.orm import Session

from core.actions.base import BaseAction
from core.constants import GIFT_COLLECTIONS_METADATA_KEY
from core.dtos.gift.collection import (
    GiftCollectionMetadataDTO,
    GiftCollectionsMetadataDTO,
    GiftFilterDTO,
    GiftFiltersDTO,
)
from core.models.gift import GiftUnique
from core.services.gift.collection import GiftCollectionService
from core.services.gift.item import GiftUniqueService
from core.services.superredis import RedisService
from core.settings import core_settings
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
        all_collections = self.collection_service.get_all(
            slugs=core_settings.whitelisted_gift_collections
        )

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

    @staticmethod
    def __construct_filter_options_query(
        options: list[GiftFilterDTO],
    ) -> ColumnElement[bool]:
        """
        Constructs an SQLAlchemy filter query using the provided list of `GiftFilterDTO` objects
        to filter gift items based on various criteria such as collection, model, backdrop, and
        pattern.

        Filters are applied with an `OR` condition between objects and an `AND` condition within
        the fields of a single object.
        Fields that are `None` are excluded from filtering.

        :param options: A list of `GiftFilterDTO`, each containing filtering options for
            collection_slug, model, backdrop, and pattern.
        :return: An SQLAlchemy `ColumnElement` representing the constructed filter query.
        """
        return or_(
            *[
                and_(
                    GiftUnique.collection_slug == option.collection,
                    *filter(
                        # Excludes None values
                        None.__ne__,
                        [
                            (GiftUnique.model == option.model)
                            if option.model
                            else None,
                            (GiftUnique.backdrop == option.backdrop)
                            if option.backdrop
                            else None,
                            (GiftUnique.pattern == option.pattern)
                            if option.pattern
                            else None,
                        ],
                    ),
                )
                for option in options
            ]
        )

    def get_collections_holders(self, options: list[GiftFilterDTO]) -> Sequence[int]:
        """
        Fetches a sequence of unique Telegram user IDs that match the provided filter options.

        The method validates the filter options using the context metadata, constructs a query
        based on the validated filters, and retrieves distinct Telegram owner IDs that satisfy
        the query conditions.
        The result is a sequence of ordered user IDs.

        :param options: A list of GiftFilterDTO objects that define the filtering criteria.
        :return: Sequence of distinct Telegram owner IDs sorted in ascending order.
        """
        validated_obj = GiftFiltersDTO.validate_with_context(
            objs=options, context=self.get_metadata()
        )
        filters = self.__construct_filter_options_query(options=validated_obj.filters)
        result = (
            self.db_session.execute(
                select(distinct(GiftUnique.telegram_owner_id))
                .where(
                    filters,
                    GiftUnique.telegram_owner_id.isnot(None),
                )
                .order_by(
                    GiftUnique.telegram_owner_id,
                )
            )
            .scalars()
            .all()
        )
        return result
