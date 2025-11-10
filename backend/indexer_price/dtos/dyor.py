from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class VerificationStatus(StrEnum):
    JVS_NONE = "JVS_NONE"
    JVS_APPROVED = "JVS_APPROVED"
    JVS_COMMUNITY_APPROVED = "JVS_COMMUNITY_APPROVED"
    JVS_VERIFIED = "JVS_VERIFIED"
    JVS_SCAM = "JVS_SCAM"


class DyorMetadata(BaseModel):
    address: str
    name: str | None = None
    symbol: str | None = None
    decimals: int | None = None
    image: str | None = None
    description: str | None = None
    offchain_image: str | None = Field(None, alias="offchain_image")
    offchain_description: str | None = Field(None, alias="offchain_description")
    created_at: datetime | None = Field(None, alias="created_at")


class DyorAmount(BaseModel):
    value_raw: float = Field(..., alias="value")
    decimals: int

    @property
    def value(self) -> float:
        return float(self.value_raw) / (10**self.decimals)


class DyorJettonDetails(BaseModel):
    metadata: DyorMetadata
    total_supply: str = Field(..., alias="totalSupply")
    verification: VerificationStatus
    price: DyorAmount | None = None
    price_usd: DyorAmount | None = Field(None, alias="priceUsd")
    holders_count: int = Field(..., alias="holdersCount")


class DyorJettonInfoResponse(BaseModel):
    details: DyorJettonDetails
