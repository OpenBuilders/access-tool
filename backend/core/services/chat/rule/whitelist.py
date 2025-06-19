import logging
from typing import Generic

from core.models.rule import TelegramChatWhitelistExternalSource, TelegramChatWhitelist
from core.services.chat.rule.base import BaseTelegramChatRuleService, TelegramChatRuleT

logger = logging.getLogger(__name__)


class BaseTelegramChatExternalSourceService(
    BaseTelegramChatRuleService,
    Generic[TelegramChatRuleT],
):

    def set_content(
        self, rule: TelegramChatRuleT, content: list[int]
    ) -> TelegramChatRuleT:
        rule.content = content
        self.db_session.commit()
        return rule

    def delete(self, chat_id: int, rule_id: int) -> None:
        self.db_session.query(self.model).filter(
            self.model.chat_id == chat_id, self.model.id == rule_id
        ).delete(synchronize_session="fetch")
        self.db_session.commit()
        logger.debug(f"Telegram Chat External Source {rule_id!r} deleted.")


class TelegramChatExternalSourceService(
    BaseTelegramChatExternalSourceService[TelegramChatWhitelistExternalSource]
):
    model = TelegramChatWhitelistExternalSource


class TelegramChatWhitelistService(
    BaseTelegramChatExternalSourceService[TelegramChatWhitelist]
):
    model = TelegramChatWhitelist
