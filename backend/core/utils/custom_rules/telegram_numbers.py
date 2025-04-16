from collections.abc import Callable

from core.enums.nft import NftCollectionAsset
from core.utils.custom_rules.addresses import NFT_ASSET_TO_ADDRESS_MAPPING
from core.models.blockchain import NftItem


class TelegramNumber:
    def __init__(self, number: str):
        prefix, *number_parts = number.split(" ")
        self.prefix = prefix
        self._number_parts = number_parts
        self.digits = "".join(number_parts)

    def __len__(self):
        return len(self.digits)


def handle_telegram_numbers_length_category(
    target_length: int,
) -> Callable[[list[NftItem]], list[NftItem]]:
    """
    Filters a list of `NftItem` objects corresponding to the Telegram Numbers category
    based on whether their associated Telegram number without a code has a length less or equal to the desired
    `target_length`.

    :param target_length: The desired length of the Telegram numbers for filtering.
    :return: A callable function that takes a list of `NftItem` objects and returns
        a filtered list of `NftItem` objects whose Telegram numbers match the specified
        target length.
    """

    def _inner(nfts: list[NftItem]) -> list[NftItem]:
        valid_nfts = []

        for nft in nfts:
            if (
                nft.collection_address
                != NFT_ASSET_TO_ADDRESS_MAPPING[NftCollectionAsset.TELEGRAM_NUMBER]
            ):
                continue

            if not nft.blockchain_metadata.name:
                continue

            telegram_number = TelegramNumber(nft.blockchain_metadata.name)

            if len(telegram_number) <= target_length:
                valid_nfts.append(nft)

        return valid_nfts

    return _inner
