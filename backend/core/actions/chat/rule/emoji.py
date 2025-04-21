import logging

from fastapi import HTTPException
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST

from core.actions.chat import ManagedChatBaseAction
from core.dtos.chat.rules.emoji import EmojiChatEligibilityRuleDTO
from core.models.user import User
from core.services.chat.rule.emoji import TelegramChatEmojiService


logger = logging.getLogger(__name__)


class TelegramChatEmojiAction(ManagedChatBaseAction):
    def __init__(self, db_session: Session, requestor: User, chat_slug: str):
        super().__init__(db_session, requestor, chat_slug)
        self.service = TelegramChatEmojiService(db_session)

    def read(self, rule_id: int) -> EmojiChatEligibilityRuleDTO:
        try:
            rule = self.service.get(chat_id=self.chat.id, rule_id=rule_id)
        except NoResultFound:
            raise HTTPException(
                detail="Rule not found",
                status_code=HTTP_404_NOT_FOUND,
            )
        return EmojiChatEligibilityRuleDTO.from_orm(rule)

    def create(self, emoji_id: str) -> EmojiChatEligibilityRuleDTO:
        if self.service.exists(chat_id=self.chat.id):
            raise HTTPException(
                detail="Telegram Emoji rule already exists for that chat. Please, modify it instead.",
                status_code=HTTP_400_BAD_REQUEST,
            )

        rule = self.service.create(chat_id=self.chat.id, emoji_id=emoji_id)
        logger.info(f"New Telegram Emoji rule created for the chat {self.chat.id!r}.")
        return EmojiChatEligibilityRuleDTO.from_orm(rule)

    def update(
        self, rule_id: int, emoji_id: str, is_enabled: bool
    ) -> EmojiChatEligibilityRuleDTO:
        try:
            rule = self.service.get(chat_id=self.chat.id, rule_id=rule_id)
        except NoResultFound:
            raise HTTPException(
                detail="Rule not found",
                status_code=HTTP_404_NOT_FOUND,
            )

        self.service.update(rule=rule, emoji_id=emoji_id, is_enabled=is_enabled)
        logger.info(
            f"Updated Telegram Emoji rule {rule_id!r} for the chat {self.chat.id!r}."
        )
        return EmojiChatEligibilityRuleDTO.from_orm(rule)

    def delete(self, rule_id: int) -> None:
        self.service.delete(chat_id=self.chat.id, rule_id=rule_id)
        logger.info(
            f"Deleted Telegram Emoji rule {rule_id!r} for the chat {self.chat.id!r}."
        )
