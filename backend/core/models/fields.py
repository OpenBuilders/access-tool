from typing import Any

from pydantic import BaseModel
from sqlalchemy import String, TypeDecorator
from sqlalchemy.dialects.mysql import JSON

from core.dtos.base import (
    BaseNftItemMetadataDTO,
    BaseNftCollectionMetadataDTO,
    NftItemAttributeDTO,
)

BlockchainAddressRawField = String(67)


class PydanticType(TypeDecorator):
    impl = JSON
    pydantic_model: type[BaseModel]

    def __init__(self, pydantic_model: type[BaseModel], *args, **kwargs):
        self.pydantic_model = pydantic_model
        super().__init__(*args, **kwargs)

    def process_bind_param(
        self, value: BaseModel, *args, **kwargs
    ) -> dict[str, Any] | None:
        if value is not None:
            return value.model_dump()
        return value

    def process_result_value(
        self, value: dict[str, Any], *args, **kwargs
    ) -> BaseModel | None:
        if value is not None:
            return self.pydantic_model.model_validate(value)
        return value


class ListPydanticType(TypeDecorator):
    impl = JSON
    pydantic_model: type[BaseModel]

    def __init__(self, pydantic_model: type[BaseModel], *args, **kwargs):
        self.pydantic_model = pydantic_model
        super().__init__(*args, **kwargs)

    def process_bind_param(
        self, value: list[BaseModel] | list[dict], *args, **kwargs
    ) -> list[dict[str, Any]] | None:
        if value and isinstance(value, list) and isinstance(value[0], BaseModel):
            return [item.model_dump() for item in value]
        return value

    def process_result_value(
        self, value: list[dict[str, Any]], *args, **kwargs
    ) -> list[BaseModel] | None:
        if value is not None:
            return [self.pydantic_model.model_validate(item) for item in value]
        return value


NftItemMetadataField = PydanticType(BaseNftItemMetadataDTO)
NftCollectionMetadataField = PydanticType(BaseNftCollectionMetadataDTO)
TelegramChatNftCollectionMetadataField = ListPydanticType(NftItemAttributeDTO)
