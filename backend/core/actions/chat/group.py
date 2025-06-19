from sqlalchemy.orm import Session

from core.actions.chat import ManagedChatBaseAction
from core.dtos.chat.group import TelegramChatRuleGroupDTO
from core.models.user import User
from core.services.chat.rule.group import TelegramChatRuleGroupService


class TelegramChatRuleGroupAction(ManagedChatBaseAction):
    def __init__(
        self, db_session: Session, requestor: User, chat_slug: str, **kwargs
    ) -> None:
        super().__init__(
            db_session=db_session, requestor=requestor, chat_slug=chat_slug
        )
        self.service = TelegramChatRuleGroupService(db_session)

    def create(self) -> TelegramChatRuleGroupDTO:
        group = self.service.create(chat_id=self.chat.id)
        return TelegramChatRuleGroupDTO.from_orm(group)

    def delete(self, group_id: int) -> None:
        self.service.delete(chat_id=self.chat.id, group_id=group_id)
