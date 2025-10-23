from typing import Any, TypeVar, Generic

from pydantic import BaseModel


_T = TypeVar("_T")


class OrderingRuleDTO(BaseModel):
    field: str
    is_ascending: bool = False


class PaginationMetadataDTO(BaseModel):
    offset: int
    limit: int
    include_total_count: bool = False


class PaginatedResultWithoutCountDTO(BaseModel, Generic[_T]):
    items: list[Any]


class PaginatedResultDTO(PaginatedResultWithoutCountDTO, Generic[_T]):
    total_count: int | None = None
