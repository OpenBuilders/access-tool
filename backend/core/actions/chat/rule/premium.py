import logging

from fastapi import HTTPException
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST

from core.actions.chat import ManagedChatBaseAction
from core.dtos.chat.rules import ChatEligibilityRuleDTO
from core.models.user import User
from core.services.chat.rule.premium import TelegramChatPremiumService


logger = logging.getLogger(__name__)


class TelegramChatPremiumAction(ManagedChatBaseAction):
    def __init__(self, db_session: Session, requestor: User, chat_slug: str):
        super().__init__(db_session, requestor, chat_slug)
        self.service = TelegramChatPremiumService(db_session)

    def read(self, rule_id: int) -> ChatEligibilityRuleDTO:
        try:
            rule = self.service.get(chat_id=self.chat.id, rule_id=rule_id)
        except NoResultFound:
            raise HTTPException(
                detail="Rule not found",
                status_code=HTTP_404_NOT_FOUND,
            )
        return ChatEligibilityRuleDTO.from_premium_rule(rule)

    def create(self) -> ChatEligibilityRuleDTO:
        if self.service.exists(chat_id=self.chat.id):
            raise HTTPException(
                detail="Telegram Premium rule already exists for that chat. Please, modify it instead.",
                status_code=HTTP_400_BAD_REQUEST,
            )

        rule = self.service.create(chat_id=self.chat.id)
        logger.info(f"New Telegram Premium rule created for the chat {self.chat.id!r}.")
        return ChatEligibilityRuleDTO.from_premium_rule(rule)

    def update(self, rule_id: int, is_enabled: bool) -> ChatEligibilityRuleDTO:
        try:
            rule = self.service.get(chat_id=self.chat.id, rule_id=rule_id)
        except NoResultFound:
            raise HTTPException(
                detail="Rule not found",
                status_code=HTTP_404_NOT_FOUND,
            )

        self.service.update(rule=rule, is_enabled=is_enabled)
        logger.info(
            f"Updated Telegram Premium rule {rule_id!r} for the chat {self.chat.id!r}."
        )
        return ChatEligibilityRuleDTO.from_premium_rule(rule)

    def delete(self, rule_id: int) -> None:
        self.service.delete(chat_id=self.chat.id, rule_id=rule_id)
        logger.info(
            f"Deleted Telegram Premium rule {rule_id!r} for the chat {self.chat.id!r}."
        )
