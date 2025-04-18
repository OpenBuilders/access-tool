from typing import Self, Any

from pydantic import BaseModel

from core.models.sticker import StickerCollection, StickerItem


class MinimalStickerCollectionDTO(BaseModel):
    id: int
    title: str

    @classmethod
    def from_orm(cls, obj: StickerCollection) -> Self:
        return cls(
            id=obj.id,
            title=obj.title,
        )


class MinimalStickerCharacterDTO(BaseModel):
    id: int
    name: str

    @classmethod
    def from_orm(cls, obj: Any) -> Self:
        return cls(
            id=obj.id,
            name=obj.name,
        )


class MinimalStickerCollectionWithCharactersDTO(MinimalStickerCollectionDTO):
    characters: list[MinimalStickerCharacterDTO]

    @classmethod
    def from_orm(cls, obj: StickerCollection) -> Self:
        return cls(
            id=obj.id,
            title=obj.title,
            characters=[
                MinimalStickerCharacterDTO.from_orm(character)
                for character in (obj.characters or [])
            ],
        )


class StickerCollectionDTO(MinimalStickerCollectionDTO):
    description: str | None
    logo_url: str | None

    @classmethod
    def from_orm(cls, obj: StickerCollection) -> Self:
        return cls(
            id=obj.id,
            title=obj.title,
            description=obj.description,
            logo_url=obj.logo_url,
        )


class StickerCharacterDTO(MinimalStickerCharacterDTO):
    collection_id: int
    description: str | None
    supply: int

    @classmethod
    def from_orm(cls, obj: Any) -> Self:
        return cls(
            id=obj.id,
            name=obj.name,
            collection_id=obj.collection_id,
            description=obj.description,
            supply=obj.supply,
        )


class StickerItemDTO(BaseModel):
    id: str
    collection_id: int
    character_id: int
    instance: int
    user_id: int

    @classmethod
    def from_orm(cls, obj: StickerItem) -> Self:
        return cls(
            id=obj.id,
            collection_id=obj.collection_id,
            character_id=obj.character_id,
            instance=obj.instance,
            user_id=obj.user_id,
        )
