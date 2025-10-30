import logging
from collections import defaultdict

from pytonapi.utils import to_amount

from core.dtos.chat.rule import TelegramChatEligibilityRulesDTO
from core.models.rule import (
    TelegramChatToncoin,
    TelegramChatJetton,
    TelegramChatNFTCollection,
    TelegramChatStickerCollection,
    TelegramChatThresholdRuleBase,
)
from core.services.ton import TonPriceManager


logger = logging.getLogger(__name__)


def calculate_group_floor_price(
    items: list[TelegramChatThresholdRuleBase], ton_price: float | None
) -> float | None:
    """
    Calculate the floor price of a group of items based on their specific attributes
    and provided ton price. The calculation involves items of different types, such
    as TelegramChatToncoin, TelegramChatJetton, TelegramChatNFTCollection, and
    TelegramChatStickerCollection, considering their respective prices and thresholds.

    :param items: A list of items of varying types whose floor price needs to be calculated.
    :param ton_price: The price of Toncoin to be used for the calculation. Can be None if not applicable.
    :return: The calculated group floor price as a float value.
    """
    if not any(
        isinstance(
            item,
            (
                TelegramChatToncoin,
                TelegramChatJetton,
                TelegramChatNFTCollection,
                TelegramChatStickerCollection,
            ),
        )
        for item in items
    ):
        return None

    result = 0.0
    for item in items:
        if isinstance(item, TelegramChatToncoin):
            result += float(ton_price * to_amount(item.threshold))

        elif isinstance(item, TelegramChatJetton):
            if item.jetton.price is None:
                logger.debug(f"No price for jetton {item.jetton.address!r}. Skipping.")
                continue
            result += float(item.jetton.price * to_amount(item.threshold))

        elif isinstance(item, TelegramChatNFTCollection):
            if item.nft_collection.price is None:
                logger.debug(
                    f"No price for nft collection {item.nft_collection.address!r}. Skipping."
                )
                continue
            result += float(item.nft_collection.price * to_amount(item.threshold))

        elif isinstance(item, TelegramChatStickerCollection):
            # Prioritize character prize, but if no character price, go for a collection floor price
            _price = getattr(item.character, "price", None) or item.collection.price
            if _price is None:
                logger.debug(
                    f"No price for {item.collection.title!r} and {getattr(item.character, 'name', None)}. Skipping."
                )
                continue
            result += float(_price * item.threshold)

    logger.debug(f"Calculated floor price for group: {result}")
    return result


def calculate_floor_price(eligibility_rules: TelegramChatEligibilityRulesDTO) -> float:
    """
    Calculates the floor price based on given eligibility rules.

    This function processes the provided eligibility rules, groups them by group ID,
    and calculates the floor price for each group using the Toncoin price manager.
    The final floor price is determined as the minimum price among all groups.

    :param eligibility_rules: Eligibility rules for Telegram chat, categorized
        into different rule types and grouped by group ID.
    :return: The calculated floor price as a floating-point number.
    """
    toncoin_price_manager = TonPriceManager()
    grouped_rules = defaultdict(list)
    # Iterate over all types of rules
    for rules in eligibility_rules.__dict__.values():
        for rule in rules:
            grouped_rules[rule.group_id].append(rule)

    ton_price = toncoin_price_manager.get_ton_price()

    valid_groups_prices = list(
        filter(
            None,
            (
                calculate_group_floor_price(items, ton_price=ton_price)
                for items in grouped_rules.values()
            ),
        )
    )

    if not valid_groups_prices:
        logger.debug("No valid groups prices found.")
        return 0.0

    floor_price = min(valid_groups_prices)
    logger.debug(f"Calculated floor price: {floor_price}")
    return floor_price
