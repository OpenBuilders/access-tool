import logging

from fastapi import HTTPException
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from starlette.status import HTTP_403_FORBIDDEN

from core.actions.base import BaseAction
from core.models.user import User
from core.models.chat import TelegramChat
from core.services.chat import TelegramChatService
from core.services.chat.user import TelegramChatUserService


logger = logging.getLogger(__name__)


class ManagedChatBaseAction(BaseAction):
    _chat: TelegramChat
    is_admin_action: bool = True

    def __init__(
        self, db_session: Session, requestor: User, chat_slug: str, **kwargs
    ) -> None:
        super().__init__(db_session)
        self.telegram_chat_service = TelegramChatService(db_session)
        self.telegram_chat_user_service = TelegramChatUserService(db_session)

        self._chat = self.__get_target_chat(requestor=requestor, chat_slug=chat_slug)

    def __get_target_chat(self, requestor: User, chat_slug: str) -> TelegramChat:
        """
        Retrieves a target chat based on the given requestor and chat slug. It attempts
        to fetch the chat using the `telegram_chat_service`. If the chat is not found, an exception
        is raised. If the action requires administrative permission, it checks whether the requestor
        is an admin of the chat using the `telegram_chat_user_service`.

        :param requestor: User object that makes the request
        :param chat_slug: Unique slug identifier for the target chat
        :return: The target TelegramChat object
        :raises HTTPException: If the chat is not found or if the requestor lacks admin permissions
        """
        try:
            chat = self.telegram_chat_service.get_by_slug(chat_slug)
        except NoResultFound:
            logger.debug(f"Chat with slug {chat_slug!r} not found")
            raise HTTPException(
                detail="Chat not found",
                status_code=404,
            )

        if self.is_admin_action:
            if not self.telegram_chat_user_service.is_chat_admin(
                chat_id=chat.id, user_id=requestor.id
            ):
                raise HTTPException(
                    detail="Forbidden",
                    status_code=HTTP_403_FORBIDDEN,
                )

        return chat

    @property
    def chat(self) -> TelegramChat:
        return self._chat
