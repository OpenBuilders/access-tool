from typing import Annotated

from fastapi.params import Query
from pydantic import BaseModel, Field

from api.pos.base import BaseFDO


class TokenFDO(BaseModel):
    access_token: str
    expires_in: int


class InitDataPO(BaseModel):
    init_data: Annotated[str, Field(..., alias="initDataRaw", min_length=1)]


class ApiTokenPO(BaseFDO):
    api_token: Annotated[str, Query(pattern=r"^[a-zA-Z0-9\-\_]+$", min_length=64)]
