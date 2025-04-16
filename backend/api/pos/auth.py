from typing import Annotated

from pydantic import BaseModel, Field


class TokenFDO(BaseModel):
    access_token: str
    expires_in: int


class InitDataPO(BaseModel):
    init_data: Annotated[str, Field(..., alias="initDataRaw")]
