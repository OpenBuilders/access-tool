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
