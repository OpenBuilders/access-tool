from typing import Self

from pydantic import model_validator

from api.pos.base import BaseFDO
from api.utils import get_cdn_absolute_url
from core.dtos.resource import JettonDTO, NftCollectionDTO
from core.dtos.base import NftCollectionAttributeDTO


class JettonFDO(BaseFDO, JettonDTO):
    @model_validator(mode="after")
    def format_logo_url(self) -> Self:
        self.logo_path = get_cdn_absolute_url(self.logo_path)
        return self


class GetJettonCPO(BaseFDO):
    whitelisted_only: bool = True


class GetNftCollectionCPO(BaseFDO):
    whitelisted_only: bool = True


class NftCollectionAttributeFDO(BaseFDO, NftCollectionAttributeDTO): ...


class NftCollectionMetadataFDO(BaseFDO):
    attributes: list[NftCollectionAttributeFDO]


class NftCollectionFDO(BaseFDO, NftCollectionDTO):
    blockchain_metadata: NftCollectionMetadataFDO | None

    @model_validator(mode="after")
    def format_logo_url(self) -> Self:
        self.logo_path = get_cdn_absolute_url(self.logo_path)
        return self
