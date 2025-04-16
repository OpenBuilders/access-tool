from core.models.rule import TelegramChatPremium
from core.services.base import BaseService


class TelegramChatPremiumService(BaseService):
    def get_all(
        self, chat_id: int, enabled_only: bool = True
    ) -> list[TelegramChatPremium]:
        query = self.db_session.query(TelegramChatPremium).filter(
            TelegramChatPremium.chat_id == chat_id
        )
        if enabled_only:
            query = query.filter(TelegramChatPremium.is_enabled.is_(True))
        return query.all()

    def get(self, chat_id: int, rule_id: int) -> TelegramChatPremium:
        return (
            self.db_session.query(TelegramChatPremium)
            .filter(
                TelegramChatPremium.chat_id == chat_id,
                TelegramChatPremium.id == rule_id,
            )
            .one()
        )

    def exists(self, chat_id: int) -> bool:
        return (
            self.db_session.query(TelegramChatPremium)
            .filter(TelegramChatPremium.chat_id == chat_id)
            .count()
            > 0
        )

    def create(self, chat_id: int) -> TelegramChatPremium:
        new_rule = TelegramChatPremium(chat_id=chat_id, is_enabled=True)
        self.db_session.add(new_rule)
        self.db_session.commit()
        return new_rule

    def update(
        self, rule: TelegramChatPremium, is_enabled: bool
    ) -> TelegramChatPremium:
        rule.is_enabled = is_enabled
        self.db_session.commit()
        return rule

    def delete(self, chat_id: int, rule_id: int) -> None:
        self.db_session.query(TelegramChatPremium).filter(
            TelegramChatPremium.chat_id == chat_id, TelegramChatPremium.id == rule_id
        ).delete(synchronize_session="fetch")
