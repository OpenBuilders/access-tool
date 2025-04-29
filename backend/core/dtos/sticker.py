import json
from typing import Self, Any

from pydantic import BaseModel

from core.models.sticker import StickerCollection, StickerItem


class MinimalStickerCollectionDTO(BaseModel):
    id: int
    title: str
    logo_url: str | None

    @classmethod
    def from_orm(cls, obj: StickerCollection) -> Self:
        return cls(
            id=obj.id,
            title=obj.title,
            logo_url=obj.logo_url,
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
            logo_url=obj.logo_url,
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


class StickerDomCollectionOwnershipMetadataDTO(BaseModel):
    collection_id: int
    url: str
    plain_dek_hex: str

    @property
    def plain_dek(self) -> bytes:
        return bytes.fromhex(self.plain_dek_hex)


class StickerDomCollectionOwnershipDTO(BaseModel):
    collection_id: int
    timestamp: str
    ownership_data: list[StickerItemDTO]

    @classmethod
    def from_raw(cls, raw: bytes, collection_id: int) -> Self:
        json_data = json.loads(raw)
        ownership_data = [
            StickerItemDTO(
                id=f"{collection_id}_{character_id}_{instance_id}_{user_id}",
                collection_id=collection_id,
                character_id=character_id,
                user_id=user_id,
                instance=instance_id,
            )
            for character_id, instances_per_user in json_data["data"].items()
            for user_instances in instances_per_user
            for user_id, instances in user_instances.items()
            for instance_id in instances
        ]
        return cls(
            collection_id=collection_id,
            timestamp=json_data["timestamp"],
            ownership_data=ownership_data,
        )


class StickerDomCollectionWithCharacters(StickerCollectionDTO):
    characters: list[StickerCharacterDTO]

    @classmethod
    def from_json(cls, collection_json: dict[str, Any]) -> Self:
        return cls(
            id=collection_json["id"],
            title=collection_json["title"],
            description=collection_json["description"],
            logo_url=collection_json["logo_url"],
            characters=[
                StickerCharacterDTO(
                    id=character["id"],
                    name=character["name"],
                    collection_id=collection_json["id"],
                    description=character["description"],
                    supply=character["supply"],
                )
                for character in collection_json["characters"]
            ],
        )
