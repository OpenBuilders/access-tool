from typing import Sequence

from fastapi import HTTPException
from sqlalchemy import and_, select, distinct, func, union_all, Select
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND

from core.actions.base import BaseAction
from core.constants import GIFT_COLLECTIONS_METADATA_KEY
from core.dtos.gift.collection import (
    GiftCollectionMetadataDTO,
    GiftCollectionsMetadataDTO,
    GiftFilterDTO,
    GiftFiltersDTO,
)
from core.dtos.gift.item import GiftUniqueDTO
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
    ) -> Select[tuple[int]]:
        """
        Constructs a SQL query to filter and retrieve unique telegram_owner_ids
        based on the provided filter options. This function processes a list
        of `GiftFilterDTO` objects, applies specific filtering criteria, and
        aggregates results based on an ownership threshold using HAVING clauses.

        The method builds multiple subqueries, each reflecting individual
        filter criteria (e.g., collection, model, backdrop, pattern) and thresholds,
        combines them using UNION ALL, and then extracts distinct owner IDs
        ordered by their values.

        :param options: A list of filter data transfer objects (`GiftFilterDTO`)
            that define the filtering criteria such as collection, model,
            backdrop, pattern, and threshold values.
        :type options: list[GiftFilterDTO]

        :return: A SQLAlchemy Select statement object to retrieve distinct
            telegram_owner_ids that satisfy the filter conditions.
        :rtype: Select[tuple[int]]
        """
        # Initialize a list of conditional subqueries
        subqueries = []

        for option in options:
            # Basic filtering logic (collection, model, backdrop, pattern)
            base_filter = and_(
                GiftUnique.collection_slug == option.collection,
                GiftUnique.telegram_owner_id.isnot(None),
                *filter(
                    None.__ne__,
                    [
                        (GiftUnique.model == option.model) if option.model else None,
                        (GiftUnique.backdrop == option.backdrop)
                        if option.backdrop
                        else None,
                        (GiftUnique.pattern == option.pattern)
                        if option.pattern
                        else None,
                    ],
                ),
            )

            # Group by telegram_owner_id and apply threshold in HAVING
            subquery = (
                select(GiftUnique.telegram_owner_id)
                .where(base_filter)
                .group_by(GiftUnique.telegram_owner_id)
                .having(func.count(1) >= option.threshold)
            )

            subqueries.append(subquery)

            # Combine all subqueries using UNION ALL
        union_query = union_all(*subqueries)

        # Final query to fetch distinct telegram_owner_id
        final_query = select(distinct(union_query.c.telegram_owner_id)).order_by(
            union_query.c.telegram_owner_id,
        )

        return final_query

    def get_collections_holders(self, options: list[GiftFilterDTO]) -> Sequence[int]:
        """
        Fetches collection holder IDs based on provided filter options.

        This method validates the specified filter options using the context derived
        from the metadata and constructs a database query using the validated filters.
        The query is then executed to retrieve all matching collection holder IDs.

        :param options: A list of GiftFilterDTO objects representing the filters to apply.
        :return: A sequence of integers representing the IDs of the collection holders
            that match the specified filter options.
        """
        validated_obj = GiftFiltersDTO.validate_with_context(
            objs=options, context=self.get_metadata()
        )
        query = self.__construct_filter_options_query(options=validated_obj.filters)
        result = self.db_session.execute(query).scalars().all()
        return result

    def get_all(self, collection_slug: str) -> Sequence[GiftUniqueDTO]:
        """
        Fetches all unique items in a given collection.
        """
        try:
            self.collection_service.get(slug=collection_slug)
        except NoResultFound:
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND,
                detail=f"Collection {collection_slug!r} not found",
            )
        return [
            GiftUniqueDTO.from_orm(gift)
            for gift in self.service.get_all(collection_slug=collection_slug)
        ]
