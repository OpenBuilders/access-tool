import logging

from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from celery import current_app as celery_app

from core.actions.base import BaseAction
from core.dtos.user import TelegramUserDTO
from core.models.user import User
from core.services.superredis import RedisService
from core.constants import (
    CELERY_GIFT_USER_QUEUE_NAME,
    USER_GIFT_REFRESH_COOLDOWN_SECONDS,
)

logger = logging.getLogger(__name__)


class UserAction(BaseAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session)

    def refresh_gifts(self, user: User) -> str | None:
        """
        Triggers user gift indexing if not rate-limited.
        Returns task_id if dispatched, None if rate-limited.
        """
        redis_service = RedisService()
        rate_limit_key = f"user-gift-refresh-{user.telegram_id}"
        if not redis_service.set(
            rate_limit_key, "1", ex=USER_GIFT_REFRESH_COOLDOWN_SECONDS, nx=True
        ):
            logger.info(f"User {user.telegram_id} gift refresh rate-limited.")
            return None

        task_result = celery_app.send_task(
            "index-user-gifts",
            args=(user.telegram_id,),
            queue=CELERY_GIFT_USER_QUEUE_NAME,
        )
        logger.info(
            f"Dispatched gift indexing task {task_result.id} for user {user.telegram_id}"
        )
        return task_result.id

    def _initial_user_indexing(self, user: User) -> None:
        """
        Indexes the user's data upon their creation in the system. This method is
        intended for internal usage to initialize the indexing process for a user.
        """
        logger.debug(f"Indexing user {user.id!r} upon creation...")
        self.refresh_gifts(user)

    def create(self, telegram_user: TelegramUserDTO) -> User:
        user = self.user_service.create(telegram_user)
        self._initial_user_indexing(user)
        return user

    def create_or_update(self, telegram_user: TelegramUserDTO) -> User:
        try:
            user = self.user_service.get_by_telegram_id(telegram_user.id)
            user = self.user_service.update(user, telegram_user)
        except NoResultFound:
            user = self.create(telegram_user)
        return user

    def get_or_create(self, telegram_user: TelegramUserDTO) -> User:
        try:
            user = self.user_service.get_by_telegram_id(telegram_user.id)
        except NoResultFound:
            user = self.create(telegram_user)
        return user
