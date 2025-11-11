import logging

from core.models.gift import GiftUnique
from core.models.rule import TelegramChatGiftCollection


logger = logging.getLogger(__name__)


def find_relevant_gift_items(
    rule: TelegramChatGiftCollection, gift_items: list[GiftUnique]
) -> list[GiftUnique]:
    """
    Finds and returns a list of relevant gift items based on the specified rule.

    This function iterates over a list of gift items and filters them according
    to the attributes defined in the provided rule object. Attributes such as
    collection_slug, model, backdrop, and pattern are used to determine the
    relevance of each item. Items that match the defined criteria are appended
    to a resulting list, which is then returned.

    :param rule: A collection rule containing attributes that define filtering
                 criteria for gift items.
    :param gift_items: A list of GiftUnique objects to be filtered based on rules.
    :return: A list of gift items that match the filtering criteria defined in the rule.
    """
    relevant_items = []

    for item in gift_items:
        if rule.category:
            # FIXME remove and validate category properly when supported
            logger.warning(f"Trying to get gifts by category {rule.category!r}.")
            continue

        if (
            rule.collection_slug is not None
            and rule.collection_slug != item.collection_slug
        ):
            continue

        if rule.model is not None and rule.model != item.model:
            continue

        if rule.backdrop is not None and rule.backdrop != item.backdrop:
            continue

        if rule.pattern is not None and rule.pattern != item.pattern:
            continue

        relevant_items.append(item)

    return relevant_items
