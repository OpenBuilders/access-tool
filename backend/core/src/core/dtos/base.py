from typing import Any, Annotated

from pydantic import BaseModel, Field


class NftItemAttributeDTO(BaseModel):
    trait_type: str
    value: Any


class BaseNftItemMetadataDTO(BaseModel):
    name: str | None = None
    description: str | None = None
    attributes: list[NftItemAttributeDTO]


class NftCollectionAttributeDTO(BaseModel):
    trait_type: str
    values: list[Any]


class BaseNftCollectionMetadataDTO(BaseModel):
    names: list[str] | None = None
    descriptions: list[str] | None = None
    attributes: list[NftCollectionAttributeDTO]


class BaseThresholdFilterDTO(BaseModel):
    threshold: Annotated[int, Field(gt=0)]
