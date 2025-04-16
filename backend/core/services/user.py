from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import joinedload

from core.dtos.user import TelegramUserDTO
from core.models.user import User
from core.services.base import BaseService


class UserService(BaseService):
    def get_all(self, telegram_ids: list[int] | None = None) -> list[User]:
        query = self.db_session.query(User)
        if telegram_ids:
            query = query.filter(User.telegram_id.in_(telegram_ids))

        return query.all()

    def get_by_telegram_id(self, telegram_id: int) -> User:
        return (
            self.db_session.query(User)
            .options(
                joinedload(User.wallets),
            )
            .filter(
                User.telegram_id == telegram_id,
            )
            .one()
        )

    def get(self, user_id: int) -> User:
        return (
            self.db_session.query(User)
            .options(
                joinedload(User.wallets),
            )
            .filter(
                User.id == user_id,
            )
            .one()
        )

    def create(self, telegram_user: TelegramUserDTO) -> User:
        new_user = User(
            first_name=telegram_user.first_name,
            last_name=telegram_user.last_name,
            telegram_id=telegram_user.id,
            username=telegram_user.username,
            is_premium=telegram_user.is_premium,
            language=telegram_user.language_code,
            allows_write_to_pm=telegram_user.allow_write_to_pm,
        )
        self.db_session.add(new_user)
        self.db_session.commit()
        return new_user

    def update(self, user: User, telegram_user: TelegramUserDTO) -> User:
        user.language = telegram_user.language_code
        user.first_name = telegram_user.first_name
        user.last_name = telegram_user.last_name
        user.username = telegram_user.username
        user.is_premium = bool(telegram_user.is_premium)
        user.allows_write_to_pm = telegram_user.allow_write_to_pm
        # TODO add photo_url
        self.db_session.add(user)
        self.db_session.commit()
        return user

    def create_or_update(self, telegram_user: TelegramUserDTO) -> User:
        try:
            user = self.get_by_telegram_id(telegram_user.id)
            return self.update(user=user, telegram_user=telegram_user)
        except NoResultFound:
            return self.create(telegram_user)

    def get_or_create(self, telegram_user: TelegramUserDTO) -> User:
        try:
            return self.get_by_telegram_id(telegram_user.id)
        except NoResultFound:
            return self.create(telegram_user)
