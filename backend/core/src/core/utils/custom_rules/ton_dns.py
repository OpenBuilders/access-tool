from collections.abc import Callable

from core.enums.nft import NftCollectionAsset
from core.utils.custom_rules.addresses import NFT_ASSET_TO_ADDRESS_MAPPING
from core.models.blockchain import NftItem


def handle_ton_dns_length_category(
    target_length: int,
) -> Callable[[list[NftItem]], list[NftItem]]:
    """
    Provides a function to filter NFTs based on the length of their blockchain metadata name.
    This is specifically designed for TON DNS category NFTs, ensuring only those with names
    of a certain length or shorter are included.

    :param target_length: The maximum allowed length of the blockchain metadata name.
    :return: A callable function that takes a list of NftItem objects and filters out those
        that belong to the TON DNS category and satisfy the name length criteria.
    """

    def _inner(nfts: list[NftItem]) -> list[NftItem]:
        valid_nfts = []

        for nft in nfts:
            if (
                nft.collection_address
                != NFT_ASSET_TO_ADDRESS_MAPPING[NftCollectionAsset.TON_DNS]
            ):
                continue

            if nft.blockchain_metadata.name is None:
                continue

            if len(nft.blockchain_metadata.name) <= target_length:
                valid_nfts.append(nft)

        return valid_nfts

    return _inner
