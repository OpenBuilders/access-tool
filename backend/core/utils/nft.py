import logging

from core.models.rule import TelegramChatNFTCollection
from core.models.blockchain import NftItem
from core.utils.custom_rules.mapping import CATEGORY_TO_METHOD_MAPPING


logger = logging.getLogger(__name__)


def find_relevant_nft_items(
    rule: TelegramChatNFTCollection, nft_items: list[NftItem]
) -> list[NftItem]:
    """
    Filters a list of NFT items based on the given rule. The function determines the
    relevant NFT items by either applying custom category-based logic or by matching
    the collection address in the rule with that in the NFT items.

    :param rule: A `TelegramChatNFTCollection` object that contains the filtering rule,
        including the asset type, category, and collection address.

    :param nft_items: A list of `NftItem` objects representing the NFT items to be
        filtered against the given rule.

    :return: A list of `NftItem` objects that satisfy the filtering rule. If a custom
        category-based logic is applied, the matching items are returned based on that logic.
        If only the collection address is used, the relevant items that match the address
        are returned. An empty list is returned if no matching custom logic is found
        for the specified category.
    """
    # If both asset type and category are set - custom rules should be applied
    if rule.asset and rule.category:
        custom_logic_method = CATEGORY_TO_METHOD_MAPPING.get(rule.category)
        # If there is a custom logic method - use it to determine whether the valid rule is applied
        if custom_logic_method:
            return custom_logic_method(nft_items)

        else:
            logger.error(
                f"No custom logic method found for category {rule.category}. Ignoring rule"
            )
            return []

    return list(filter(lambda item: item.collection_address == rule.address, nft_items))
