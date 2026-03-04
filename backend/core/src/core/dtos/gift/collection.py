import datetime
from typing import Self

from pydantic import BaseModel
from telethon.tl.types import StarGiftUnique

from core.models.gift import GiftCollection


class GiftCollectionDTO(BaseModel):
    id: int
    title: str
    preview_url: str | None
    supply: int
    upgraded_count: int
    last_updated: datetime.datetime

    @classmethod
    def from_orm(cls, obj: GiftCollection) -> Self:
        return cls(
            id=obj.id,
            title=obj.title,
            preview_url=obj.preview_url,
            supply=obj.supply,
            upgraded_count=obj.upgraded_count,
            last_updated=obj.last_updated,
        )

    @classmethod
    def from_telethon(cls, id: int, obj: StarGiftUnique, preview_url: str) -> Self:
        return cls(
            id=id,
            title=obj.title,
            preview_url=preview_url,
            supply=obj.availability_total,
            upgraded_count=obj.availability_issued,
            last_updated=datetime.datetime.now(tz=datetime.UTC),
        )


class GiftCollectionMetadataDTO(BaseModel):
    id: int
    title: str
    preview_url: str | None
    supply: int
    upgraded_count: int
    models: list[str]
    backdrops: list[str]
    patterns: list[str]


class GiftCollectionsMetadataDTO(BaseModel):
    collections: list[GiftCollectionMetadataDTO]


class GiftFilterDTO(BaseModel):
    collection_id: int
    model: str | None = None
    backdrop: str | None = None
    pattern: str | None = None
    threshold: int = 1


class GiftFiltersDTO(BaseModel):
    filters: list[GiftFilterDTO]

    @classmethod
    def validate_with_context(
        cls, objs: list[GiftFilterDTO], context: GiftCollectionsMetadataDTO
    ) -> Self:
        context_by_id = {
            collection.id: collection for collection in context.collections
        }
        for obj in objs:
            if not (collection_metadata := context_by_id.get(obj.collection_id)):
                raise ValueError(
                    f"Collection {obj.collection_id} not found in metadata"
                )

            if obj.model and obj.model not in collection_metadata.models:
                raise ValueError(
                    f"Model {obj.model} not found in collection {obj.collection_id}"
                )

            if obj.backdrop and obj.backdrop not in collection_metadata.backdrops:
                raise ValueError(
                    f"Backdrop {obj.backdrop} not found in collection {obj.collection_id}"
                )

            if obj.pattern and obj.pattern not in collection_metadata.patterns:
                raise ValueError(
                    f"Pattern {obj.pattern} not found in collection {obj.collection_id}"
                )

        return cls(filters=objs)
