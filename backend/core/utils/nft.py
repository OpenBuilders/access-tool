import logging

from core.models.rule import TelegramChatNFTCollection
from core.models.blockchain import NftItem
from core.utils.custom_rules.mapping import CATEGORY_TO_METHOD_MAPPING


logger = logging.getLogger(__name__)


def find_relevant_nft_items(
    rule: TelegramChatNFTCollection, nft_items: list[NftItem]
) -> list[NftItem]:
    """
    Find relevant NFT items for the rule
    """
    # Means - custom rules should be applied
    if rule.asset:
        custom_logic_method = CATEGORY_TO_METHOD_MAPPING.get(rule.category)
        # If there is a custom logic method - use it to determine whether the valid rule is applied
        if custom_logic_method:
            return custom_logic_method(nft_items)

        else:
            logger.error(
                f"No custom logic method found for category {rule.category}. Ignoring rule"
            )
            return []

    print("No asset, but: ", rule.address, [i.collection_address for i in nft_items])

    return list(filter(lambda item: item.collection_address == rule.address, nft_items))
