from typing import Any, Self

from pydantic import BaseModel, computed_field

from core.constants import PROMOTE_STICKER_COLLECTION_TEMPLATE
from core.dtos.chat.rules import ChatEligibilityRuleDTO, EligibilityCheckType
from core.dtos.sticker import MinimalStickerCollectionDTO, MinimalStickerCharacterDTO


class BaseTelegramChatStickerCollectionRuleDTO(BaseModel):
    threshold: int
    is_enabled: bool
    collection_id: int | None
    character_id: int | None
    category: str | None


class CreateTelegramChatStickerCollectionRuleDTO(
    BaseTelegramChatStickerCollectionRuleDTO
):
    chat_id: int


class UpdateTelegramChatStickerCollectionRuleDTO(
    BaseTelegramChatStickerCollectionRuleDTO
):
    ...


class StickerChatEligibilityRuleDTO(ChatEligibilityRuleDTO):
    collection: MinimalStickerCollectionDTO | None
    character: MinimalStickerCharacterDTO | None

    @computed_field
    def promote_url(self) -> str | None:
        if self.collection:
            return PROMOTE_STICKER_COLLECTION_TEMPLATE.format(
                collection_id=self.collection.id
            )

        return None

    @classmethod
    def from_orm(cls, obj: Any) -> Self:
        return cls(
            id=obj.id,
            type=EligibilityCheckType.STICKER_COLLECTION,
            title=(
                obj.category
                or (obj.character.name if obj.character else None)
                or (obj.collection.title if obj.collection else None)
            ),
            expected=obj.threshold,
            photo_url=None,
            blockchain_address=None,
            is_enabled=obj.is_enabled,
            collection=MinimalStickerCollectionDTO.from_orm(obj.collection)
            if obj.collection
            else None,
            character=MinimalStickerCharacterDTO.from_orm(obj.character)
            if obj.character
            else None,
        )
