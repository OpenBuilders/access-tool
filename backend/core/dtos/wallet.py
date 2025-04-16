from typing import Annotated

from pydantic import BaseModel, Field


class TonProofDomainPO(BaseModel):
    length_bytes: Annotated[int, Field(alias="lengthBytes")]
    value: str

    class Config:
        extra = "ignore"


class TonProofPO(BaseModel):
    timestamp: int
    domain: TonProofDomainPO
    signature: str
    payload: str


class WalletDetailsWithProofDTO(BaseModel):
    ton_proof: TonProofPO
    wallet_address: str
    public_key: str
