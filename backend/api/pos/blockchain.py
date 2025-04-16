from api.pos.base import BaseFDO
from core.dtos.resource import JettonDTO, NftCollectionDTO
from core.dtos.base import NftCollectionAttributeDTO


class JettonFDO(BaseFDO, JettonDTO):
    ...


class GetJettonCPO(BaseFDO):
    whitelisted_only: bool = True


class GetNftCollectionCPO(BaseFDO):
    whitelisted_only: bool = True


class NftCollectionAttributeFDO(BaseFDO, NftCollectionAttributeDTO):
    ...


class NftCollectionMetadataFDO(BaseFDO):
    attributes: list[NftCollectionAttributeFDO]


class NftCollectionFDO(BaseFDO, NftCollectionDTO):
    blockchain_metadata: NftCollectionMetadataFDO | None
