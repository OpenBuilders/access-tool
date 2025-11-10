from pydantic import BaseModel, Field


class StickerToolsFloor(BaseModel):
    usd: float
    ton: float


class StickerToolsPrice(BaseModel):
    floor: StickerToolsFloor


class StickerToolsCharacterStats(BaseModel):
    price: StickerToolsPrice


class StickerToolsCharacter(BaseModel):
    id: int
    name: str
    current: StickerToolsCharacterStats


class StickerToolsCollection(BaseModel):
    id: int
    name: str
    characters: dict[int, StickerToolsCharacter] = Field(..., alias="stickers")


class StickerToolsStats(BaseModel):
    collections: dict[int, StickerToolsCollection]
