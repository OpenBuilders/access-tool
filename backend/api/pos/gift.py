from typing import Self
from urllib.parse import unquote

from pydantic import model_validator

from api.pos.base import BaseFDO
from api.utils import get_cdn_absolute_url
from core.dtos.gift.collection import (
    GiftCollectionMetadataDTO,
    GiftCollectionsMetadataDTO,
    GiftCollectionDTO,
    GiftFilterDTO,
)
from core.dtos.gift.item import GiftUniqueDTO


class GiftCollectionFDO(BaseFDO, GiftCollectionDTO):
    ...


class GiftCollectionMetadataFDO(BaseFDO, GiftCollectionMetadataDTO):
    @classmethod
    def from_dto(cls, dto: GiftCollectionMetadataDTO) -> Self:
        return cls.model_validate(dto.model_dump())

    @model_validator(mode="after")
    def format_preview_url(self) -> Self:
        self.preview_url = get_cdn_absolute_url(self.preview_url)
        return self


class GiftCollectionsMetadataFDO(BaseFDO, GiftCollectionsMetadataDTO):
    collections: list[GiftCollectionMetadataFDO]

    @classmethod
    def from_dto(cls, dto: GiftCollectionsMetadataDTO) -> Self:
        return cls.model_validate(dto.model_dump())


class GiftFilterPO(GiftFilterDTO):
    @classmethod
    def from_query_string(cls, value: str) -> Self:
        return cls.model_validate_json(unquote(value))


class GiftUniqueInfoFDO(BaseFDO):
    id: int
    model: str
    backdrop: str | None = None
    pattern: str | None = None
    telegram_owner_id: int | None = None
    owner_address: str | None = None

    @classmethod
    def from_dto(cls, obj: GiftUniqueDTO) -> Self:
        return cls(
            id=obj.number,
            model=obj.model,
            backdrop=obj.backdrop,
            pattern=obj.pattern,
            telegram_owner_id=obj.telegram_owner_id,
            owner_address=obj.owner_address,
        )


class GiftUniqueItemsFDO(BaseFDO):
    items: list[GiftUniqueInfoFDO]
