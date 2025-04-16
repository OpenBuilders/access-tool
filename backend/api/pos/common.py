from pydantic import BaseModel

from api.pos.base import BaseFDO


class StatusFDO(BaseModel):
    status: str
    message: str


class CategoriesFDO(BaseFDO):
    asset: str
    categories: list[str]
