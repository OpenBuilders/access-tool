from core.models.rule import TelegramChatRuleGroup
from core.services.base import BaseService


class TelegramChatRuleGroupService(BaseService):
    def get(self, chat_id: int, group_id: int) -> TelegramChatRuleGroup:
        return self.db_session.query(TelegramChatRuleGroup).filter(
            TelegramChatRuleGroup.chat_id == chat_id,
            TelegramChatRuleGroup.id == group_id,
        ).one()

    def get_default_for_chat(self, chat_id: int) -> TelegramChatRuleGroup:
        default_group = self.db_session.query(TelegramChatRuleGroup).filter(
            TelegramChatRuleGroup.chat_id == chat_id,
        ).order_by(
            TelegramChatRuleGroup.order
        ).first()

        if not default_group:
            raise ValueError(f"No default group found for chat {chat_id!r}.")

        return default_group

    def create(self, chat_id: int, order: int = 1) -> TelegramChatRuleGroup:
        new_group = TelegramChatRuleGroup(
            chat_id=chat_id,
            order=order,
        )
        self.db_session.add(new_group)
        self.db_session.commit()
        return new_group
