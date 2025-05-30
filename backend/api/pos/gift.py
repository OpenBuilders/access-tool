from typing import Self

from pydantic import model_validator

from api.pos.base import BaseFDO
from api.utils import get_cdn_absolute_url
from core.dtos.gift.collection import (
    GiftCollectionMetadataDTO,
    GiftCollectionsMetadataDTO,
    GiftCollectionDTO,
)


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
