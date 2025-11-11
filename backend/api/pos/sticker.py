from typing import Self

from api.pos.base import BaseFDO
from core.dtos.sticker import (
    MinimalStickerCollectionWithCharactersDTO,
    MinimalStickerCharacterDTO,
    MinimalStickerCollectionDTO,
)


class MinimalStickerCollectionFDO(BaseFDO, MinimalStickerCollectionDTO): ...


class MinimalStickerCharacterFDO(BaseFDO, MinimalStickerCharacterDTO):
    @classmethod
    def from_dto(cls, dto: MinimalStickerCharacterDTO) -> Self:
        return cls(
            id=dto.id,
            name=dto.name,
            logo_url=dto.logo_url,
        )


class MinimalStickerCollectionWithCharactersFDO(
    BaseFDO, MinimalStickerCollectionWithCharactersDTO
):
    characters: list[MinimalStickerCharacterFDO]

    @classmethod
    def from_dto(cls, dto: MinimalStickerCollectionWithCharactersDTO) -> Self:
        return cls(
            id=dto.id,
            title=dto.title,
            logo_url=dto.logo_url,
            characters=[MinimalStickerCharacterFDO.from_dto(c) for c in dto.characters],
        )
