from typing import Any

from pydantic import BaseModel


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
