from datetime import datetime

from pydantic import BaseModel


class DyorMetadata(BaseModel):
    address: str
    name: str | None = None
    symbol: str | None = None
    decimals: int | None = None
    image: str | None = None
    description: str | None = None
    offchainImage: str | None = None
    offchainDescription: str | None = None
    createdAt: datetime | None = None


class DyorAmount(BaseModel):
    value: str
    decimals: int


class DyorJettonDetails(BaseModel):
    metadata: DyorMetadata
    totalSupply: str
    verification: str
    price: DyorAmount | None = None
    priceUsd: DyorAmount | None = None
    holdersCount: str


class DyorJettonInfoResponse(BaseModel):
    details: DyorJettonDetails
