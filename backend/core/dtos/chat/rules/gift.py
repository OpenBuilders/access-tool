from typing import Self

from pydantic import BaseModel, model_validator

from core.dtos.chat.rules import ChatEligibilityRuleDTO, EligibilityCheckType
from core.dtos.gift.collection import GiftCollectionDTO
from core.models.rule import TelegramChatGiftCollection


class BaseTelegramChatGiftCollectionRuleDTO(BaseModel):
    threshold: int
    is_enabled: bool
    collection_slug: str | None
    model: str | None
    backdrop: str | None
    pattern: str | None
    category: str | None

    @model_validator(mode="after")
    def validate_slug_or_category(self) -> Self:
        if (self.category is None) == (self.collection_slug is None):
            raise ValueError(
                "Either category or collection_slug must be provided and not both."
            )

        return self


class CreateTelegramChatGiftCollectionRuleDTO(BaseTelegramChatGiftCollectionRuleDTO):
    chat_id: int


class UpdateTelegramChatGiftCollectionRuleDTO(BaseTelegramChatGiftCollectionRuleDTO):
    ...


class GiftChatEligibilityRuleDTO(ChatEligibilityRuleDTO):
    collection: GiftCollectionDTO | None
    model: str | None
    backdrop: str | None
    pattern: str | None

    @classmethod
    def from_orm(cls, obj: TelegramChatGiftCollection) -> Self:
        return cls(
            id=obj.id,
            type=EligibilityCheckType.GIFT_COLLECTION,
            title=obj.collection.title if obj.collection else obj.category,
            expected=obj.threshold,
            photo_url=obj.backdrop,
            blockchain_address=None,
            is_enabled=obj.is_enabled,
            collection=GiftCollectionDTO.from_orm(obj.collection)
            if obj.collection
            else None,
            category=obj.category,
            model=obj.model,
            pattern=obj.pattern,
            backdrop=obj.backdrop,
        )
