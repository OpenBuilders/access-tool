from typing import Self

from pydantic import BaseModel

from core.models.sticker import StickerCollection, StickerItem


class StickerCollectionDTO(BaseModel):
    id: int
    title: str
    description: str | None
    logo_url: str | None
    supply: int

    @classmethod
    def from_orm(cls, obj: StickerCollection) -> Self:
        return cls(
            id=obj.id,
            title=obj.title,
            description=obj.description,
            logo_url=obj.logo_url,
            supply=obj.supply,
        )


class StickerItemDTO(BaseModel):
    id: str
    collection_id: int
    instance: int
    user_id: int

    @classmethod
    def from_orm(cls, obj: StickerItem) -> Self:
        return cls(
            id=obj.id,
            collection_id=obj.collection_id,
            instance=obj.instance,
            user_id=obj.user_id,
        )
