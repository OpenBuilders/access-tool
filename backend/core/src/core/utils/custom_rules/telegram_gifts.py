import logging
from collections.abc import Callable

from core.enums.nft import TelegramGiftsCategory
from core.models.blockchain import NftItem
from core.utils.custom_rules.addresses import NFT_CATEGORY_TO_ADDRESS_MAPPING


logger = logging.getLogger(__name__)


def handle_telegram_gifts_type_category(
    category: TelegramGiftsCategory,
) -> Callable[[list[NftItem]], list[NftItem]]:
    def _inner(nft_items: list[NftItem]) -> list[NftItem]:
        collection_address = NFT_CATEGORY_TO_ADDRESS_MAPPING.get(category)
        if not collection_address:
            logger.warning(
                f"Wasn't able to find address mapping for category {category!r}."
            )
            return []

        return list(
            filter(
                lambda item: item.collection_address == collection_address,
                nft_items,
            )
        )

    return _inner
