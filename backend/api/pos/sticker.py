from api.pos.base import BaseFDO
from core.dtos.sticker import MinimalStickerCollectionWithCharactersDTO


class MinimalStickerCollectionWithCharactersFDO(
    BaseFDO, MinimalStickerCollectionWithCharactersDTO
):
    ...
