import re
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


def _is_telegram_number(nft_item: NftItem) -> bool:
    if (
        nft_item.collection_address
        != NFT_ASSET_TO_ADDRESS_MAPPING[NftCollectionAsset.TELEGRAM_NUMBER]
    ):
        return False

    if not nft_item.blockchain_metadata.name:
        return False

    return True


def _is_valid_length(item: NftItem, target_length: int) -> bool:
    telegram_number = TelegramNumber(item.blockchain_metadata.name)
    return len(telegram_number) <= target_length


def _is_substring_in_number(item: NftItem, substring: str) -> bool:
    telegram_number = TelegramNumber(item.blockchain_metadata.name)
    return substring in telegram_number.digits


def _is_regex_matched(item: NftItem, regex_pattern: re.Pattern) -> bool:
    telegram_number = TelegramNumber(item.blockchain_metadata.name)
    return bool(regex_pattern.match(telegram_number.digits))


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
        return list(
            filter(
                lambda item: _is_telegram_number(item)
                and _is_valid_length(item, target_length=target_length),
                nfts,
            )
        )

    return _inner


def handle_telegram_numbers_substring_category(
    substring: str,
) -> Callable[[list[NftItem]], list[NftItem]]:
    def _inner(nfts: list[NftItem]) -> list[NftItem]:
        return list(
            filter(
                lambda item: _is_telegram_number(item)
                and _is_substring_in_number(item, substring=substring),
                nfts,
            )
        )

    return _inner


def handle_telegram_numbers_regex_match_category(
    regex_pattern: re.Pattern,
) -> Callable[[list[NftItem]], list[NftItem]]:
    def _inner(nfts: list[NftItem]) -> list[NftItem]:
        return list(
            filter(
                lambda item: _is_telegram_number(item)
                and _is_regex_matched(item, regex_pattern=regex_pattern),
                nfts,
            )
        )

    return _inner
