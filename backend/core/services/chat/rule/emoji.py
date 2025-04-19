from core.exceptions.rule import TelegramChatRuleExists
from core.models.rule import TelegramChatEmoji
from core.services.base import BaseService


class TelegramChatEmojiService(BaseService):
    def get_all(
        self, chat_id: int, enabled_only: bool = True
    ) -> list[TelegramChatEmoji]:
        query = self.db_session.query(TelegramChatEmoji).filter(
            TelegramChatEmoji.chat_id == chat_id
        )
        if enabled_only:
            query = query.filter(TelegramChatEmoji.is_enabled.is_(True))
        return query.all()

    def get(self, chat_id: int, rule_id: int) -> TelegramChatEmoji:
        return (
            self.db_session.query(TelegramChatEmoji)
            .filter(
                TelegramChatEmoji.chat_id == chat_id,
                TelegramChatEmoji.id == rule_id,
            )
            .one()
        )

    def exists(self, chat_id: int) -> bool:
        return (
            self.db_session.query(TelegramChatEmoji)
            .filter(TelegramChatEmoji.chat_id == chat_id)
            .count()
            > 0
        )

    def create(self, chat_id: int, emoji_id: str) -> TelegramChatEmoji:
        if self.exists(chat_id):
            raise TelegramChatRuleExists(
                "Telegram Chat rule of that type for that chat already exists."
            )
        new_rule = TelegramChatEmoji(
            chat_id=chat_id, emoji_id=emoji_id, is_enabled=True
        )
        self.db_session.add(new_rule)
        self.db_session.commit()
        return new_rule

    def update(
        self, rule: TelegramChatEmoji, emoji_id: str, is_enabled: bool
    ) -> TelegramChatEmoji:
        rule.emoji_id = emoji_id
        rule.is_enabled = is_enabled
        self.db_session.commit()
        return rule

    def delete(self, chat_id: int, rule_id: int) -> None:
        self.db_session.query(TelegramChatEmoji).filter(
            TelegramChatEmoji.chat_id == chat_id, TelegramChatEmoji.id == rule_id
        ).delete(synchronize_session="fetch")
