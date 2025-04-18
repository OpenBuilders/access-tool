from core.models.rule import TelegramChatStickerCollection
from core.services.chat.rule.base import BaseTelegramChatRuleService


class TelegramChatStickerCollectionService(BaseTelegramChatRuleService):
    model = TelegramChatStickerCollection
