import datetime
from typing import Self

from pydantic import BaseModel
from telethon.tl.types import StarGiftUnique

from core.models.gift import GiftCollection


class GiftCollectionDTO(BaseModel):
    slug: str
    title: str
    preview_url: str | None
    supply: int
    upgraded_count: int
    last_updated: datetime.datetime

    @classmethod
    def from_orm(cls, obj: GiftCollection) -> Self:
        return cls(
            slug=obj.slug,
            title=obj.title,
            preview_url=obj.preview_url,
            supply=obj.supply,
            upgraded_count=obj.upgraded_count,
            last_updated=obj.last_updated,
        )

    @classmethod
    def from_telethon(cls, slug: str, obj: StarGiftUnique, preview_url: str) -> Self:
        return cls(
            slug=slug,
            title=obj.title,
            preview_url=preview_url,
            supply=obj.availability_total,
            upgraded_count=obj.availability_issued,
            last_updated=datetime.datetime.now(tz=datetime.UTC),
        )


class GiftCollectionMetadataDTO(BaseModel):
    slug: str
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
    collection: str
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
        context_by_slug = {
            collection.slug: collection for collection in context.collections
        }
        for obj in objs:
            if not (collection_metadata := context_by_slug.get(obj.collection)):
                raise ValueError(f"Collection {obj.collection} not found in metadata")

            if obj.model and obj.model not in collection_metadata.models:
                raise ValueError(
                    f"Model {obj.model} not found in collection {obj.collection}"
                )

            if obj.backdrop and obj.backdrop not in collection_metadata.backdrops:
                raise ValueError(
                    f"Backdrop {obj.backdrop} not found in collection {obj.collection}"
                )

            if obj.pattern and obj.pattern not in collection_metadata.patterns:
                raise ValueError(
                    f"Pattern {obj.pattern} not found in collection {obj.collection}"
                )

        return cls(filters=objs)
