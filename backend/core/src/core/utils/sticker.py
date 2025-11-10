import logging

from core.models.rule import TelegramChatStickerCollection
from core.models.sticker import StickerItem


logger = logging.getLogger(__name__)


def find_relevant_sticker_items(
    rule: TelegramChatStickerCollection, sticker_items: list[StickerItem]
) -> list[StickerItem]:
    """
    Find relevant sticker items based on specified rules.

    This function filters a list of `StickerItem` instances and returns a list
    containing only items that match the provided rules defined in a
    `TelegramChatStickerCollection` object. The filtering is done based on
    the `collection_id` and `character_id` attributes of the rule.

    If the `category` attribute is specified in the rule, it logs a warning and skips filtering
    based on the category as it is not supported yet.

    :param rule: Rule definition containing filtering criteria for sticker items.
    :param sticker_items: List of sticker items to be filtered.
    :return: List of `StickerItem` instances that match the filtering criteria.
    """
    relevant_sticker_items = []

    for item in sticker_items:
        if rule.category:
            logger.warning(f"Trying to get stickers by category {rule.category!r}.")
            continue

        if rule.collection_id is not None and rule.collection_id != item.collection_id:
            continue

        if rule.character_id is not None and rule.character_id != item.character_id:
            continue

        relevant_sticker_items.append(item)

    return relevant_sticker_items
