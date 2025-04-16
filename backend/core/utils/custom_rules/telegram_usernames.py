from collections.abc import Callable

from core.enums.nft import NftCollectionAsset
from core.utils.custom_rules.addresses import NFT_ASSET_TO_ADDRESS_MAPPING
from core.models.blockchain import NftItem


class TelegramUsername:
    def __init__(self, username: str):
        # The first character is "at" - @
        self.username = username[1:]

    def __len__(self):
        return len(self.username)


def handle_telegram_username_length_category(
    target_length: int,
) -> Callable[[list[NftItem]], list[NftItem]]:
    """
    Handles filtering of NFTs based on their collection type and name length. Specifically filters
    NFTs belonging to the Telegram username category and ensures that their name length is less or equal
    compared to the given target length. Returns a callable that applies this filtering logic.

    :param target_length: The desired character length for the NFT name.
    :return: A callable function that accepts a list of NftItem objects and filters them based on
             the collection type and name length.
    """

    def _inner(nfts: list[NftItem]) -> list[NftItem]:
        valid_nfts = []

        for nft in nfts:
            if (
                nft.collection_address
                != NFT_ASSET_TO_ADDRESS_MAPPING[NftCollectionAsset.TELEGRAM_USERNAME]
            ):
                continue

            if not nft.blockchain_metadata.name:
                continue

            telegram_username = TelegramUsername(nft.blockchain_metadata.name)

            print(telegram_username.username, target_length, len(telegram_username))

            if len(telegram_username) <= target_length:
                valid_nfts.append(nft)

        return valid_nfts

    return _inner
