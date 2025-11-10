from pydantic import BaseModel, Field


class TonPrice(BaseModel):
    symbol: str = Field(..., alias="Symbol")
    name: str = Field(..., alias="Name")
    price: float = Field(..., alias="Price")
