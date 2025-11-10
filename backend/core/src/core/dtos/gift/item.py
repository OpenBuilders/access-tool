import datetime
from typing import Self

from pydantic import BaseModel
from telethon.tl.types import (
    StarGiftUnique,
    StarGiftAttributeModel,
    StarGiftAttributeBackdrop,
    StarGiftAttributePattern,
)

from core.models.gift import GiftUnique


class GiftUniqueDTO(BaseModel):
    slug: str
    collection_slug: str
    telegram_owner_id: int | None
    number: int
    blockchain_address: str | None
    owner_address: str | None
    model: str
    backdrop: str
    pattern: str
    last_updated: datetime.datetime

    @classmethod
    def from_orm(cls, obj: GiftUnique) -> Self:
        return cls(
            slug=obj.slug,
            collection_slug=obj.collection_slug,
            telegram_owner_id=obj.telegram_owner_id,
            number=obj.number,
            blockchain_address=obj.blockchain_address,
            owner_address=obj.owner_address,
            model=obj.model,
            backdrop=obj.backdrop,
            pattern=obj.pattern,
            last_updated=obj.last_updated,
        )

    @classmethod
    def from_telethon(cls, collection_slug: str, obj: StarGiftUnique) -> Self:
        model_attribute = next(
            (
                attribute
                for attribute in obj.attributes
                if isinstance(attribute, StarGiftAttributeModel)
            ),
            None,
        )
        backdrop_attribute = next(
            (
                attribute
                for attribute in obj.attributes
                if isinstance(attribute, StarGiftAttributeBackdrop)
            ),
            None,
        )
        pattern_attribute = next(
            (
                attribute
                for attribute in obj.attributes
                if isinstance(attribute, StarGiftAttributePattern)
            ),
            None,
        )

        if not all((model_attribute, backdrop_attribute, pattern_attribute)):
            raise ValueError(
                f"Missing attributes: {model_attribute}, {backdrop_attribute}, {pattern_attribute}"
            )

        return cls(
            slug=obj.slug,
            collection_slug=collection_slug,
            telegram_owner_id=getattr(obj.owner_id, "user_id", None),
            number=obj.num,
            blockchain_address=obj.gift_address,
            owner_address=obj.owner_address,
            model=model_attribute.name,
            backdrop=backdrop_attribute.name,
            pattern=pattern_attribute.name,
            last_updated=datetime.datetime.now(tz=datetime.UTC),
        )
