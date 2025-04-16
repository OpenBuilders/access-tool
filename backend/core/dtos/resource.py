from collections import defaultdict
from typing import Self

from pydantic import BaseModel
from pytonapi.schema.jettons import JettonInfo
from pytonapi.schema.nft import NftItem as TONNftItem, NftCollection
from pytonapi.utils import to_amount

from core.dtos.base import (
    NftItemAttributeDTO,
    BaseNftItemMetadataDTO,
    NftCollectionAttributeDTO,
    BaseNftCollectionMetadataDTO,
)
from core.models.blockchain import Jetton, NFTCollection


class NftItemMetadataDTO(BaseNftItemMetadataDTO):
    @classmethod
    def from_nft_item(cls, nft_item: TONNftItem) -> Self:
        return cls(
            name=nft_item.metadata.get("name"),
            description=nft_item.metadata.get("description"),
            attributes=[
                NftItemAttributeDTO(
                    trait_type=trait["trait_type"],
                    value=trait["value"],
                )
                # NFT item could have no attributes
                for trait in nft_item.metadata.get("attributes", [])
            ],
        )


class NftCollectionMetadataDTO(BaseNftCollectionMetadataDTO):
    @classmethod
    def from_items_metadata(cls, items_metadata: list[NftItemMetadataDTO]) -> Self:
        combined = defaultdict(set)
        attributes_combined = defaultdict(set)
        for item_metadata in items_metadata:
            for attribute in item_metadata.attributes:
                attributes_combined[attribute.trait_type].add(attribute.value)
                if item_metadata.name:
                    combined["name"].add(item_metadata.name)
                if item_metadata.description:
                    combined["description"].add(item_metadata.description)

        return cls(
            names=list(combined["name"]),
            descriptions=list(combined["description"]),
            attributes=[
                NftCollectionAttributeDTO(
                    trait_type=trait_type,
                    values=sorted(values),
                )
                for trait_type, values in combined.items()
            ],
        )


class JettonDTO(BaseModel):
    address: str
    name: str
    description: str | None
    symbol: str
    logo_path: str | None
    is_enabled: bool
    total_supply: int | None = None

    @classmethod
    def from_orm(cls, obj: "Jetton") -> Self:
        return cls(
            address=obj.address,
            name=obj.name,
            description=obj.description,
            symbol=obj.symbol,
            logo_path=obj.logo_path,
            total_supply=obj.total_supply,
            is_enabled=obj.is_enabled,
        )

    @classmethod
    def from_info(cls, obj: JettonInfo, logo_path: str | None = None) -> Self:
        return cls(
            address=obj.metadata.address.to_raw(),
            name=obj.metadata.name,
            description=obj.metadata.description,
            symbol=obj.metadata.symbol,
            total_supply=int(to_amount(int(obj.total_supply))),
            logo_path=logo_path,
            is_enabled=True,
        )


class NftCollectionDTO(BaseModel):
    address: str
    name: str
    description: str | None
    logo_path: str | None
    is_enabled: bool
    blockchain_metadata: BaseNftCollectionMetadataDTO | None = None

    @classmethod
    def from_orm(cls, obj: NFTCollection) -> Self:
        return cls(
            address=obj.address,
            name=obj.name,
            description=obj.description,
            logo_path=obj.logo_path,
            is_enabled=obj.is_enabled,
            blockchain_metadata=obj.blockchain_metadata,
        )

    @classmethod
    def from_info(cls, obj: NftCollection, logo_path: str | None = None) -> Self:
        return cls(
            address=obj.address.to_raw(),
            name=obj.metadata["name"],
            description=obj.metadata["description"],
            logo_path=logo_path,
            is_enabled=True,
            blockchain_metadata=None,
        )
