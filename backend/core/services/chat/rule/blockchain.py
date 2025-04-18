import logging

from core.models.rule import (
    TelegramChatJetton,
    TelegramChatNFTCollection,
    TelegramChatToncoin,
)
from core.services.chat.rule.base import BaseTelegramChatRuleService

logger = logging.getLogger(__name__)


class TelegramChatJettonService(BaseTelegramChatRuleService):
    model = TelegramChatJetton


class TelegramChatNFTCollectionService(BaseTelegramChatRuleService):
    model = TelegramChatNFTCollection


class TelegramChatToncoinService(BaseTelegramChatRuleService):
    model = TelegramChatToncoin
