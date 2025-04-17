import logging

from slugify import slugify
from sqlalchemy.exc import NoResultFound
from telethon.tl.types import Channel

from core.models.chat import TelegramChat, TelegramChatUser

from core.services.base import BaseService

logger = logging.getLogger(__name__)


class TelegramChatService(BaseService):
    def create(self, chat_id: int, entity: Channel, logo_path: str) -> TelegramChat:
        chat = TelegramChat(
            id=chat_id,
            username=entity.username,
            title=entity.title,
            is_forum=entity.forum,
            logo_path=logo_path,
            insufficient_privileges=False,
            # TODO: handle cases with the same slug
            slug=slugify(entity.title),
        )
        self.db_session.add(chat)
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat.title!r} created.")
        return chat

    def update(
        self, entity: Channel, chat: TelegramChat, logo_path: str
    ) -> TelegramChat:
        chat.username = entity.username
        chat.title = entity.title
        chat.slug = slugify(entity.title)
        chat.is_forum = entity.forum
        chat.logo_path = logo_path
        # If the chat had insufficient permissions, we reset it
        chat.insufficient_privileges = False
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat.title!r} updated.")
        return chat

    def set_insufficient_privileges(
        self, chat_id: int, value: bool = True
    ) -> TelegramChat:
        chat = self.get(chat_id)
        if chat.insufficient_privileges != value:
            chat.insufficient_privileges = value
            self.db_session.commit()
            logger.debug(
                f"Telegram Chat {chat.title!r} insufficient permissions set to {value=}."
            )
        else:
            logger.debug(
                f"Telegram Chat {chat.title!r} insufficient permissions already set to {value=}."
            )
        return chat

    def update_description(self, chat: TelegramChat, description: str) -> TelegramChat:
        chat.description = description
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat.title!r} description updated.")
        return chat

    def create_or_update(
        self, chat_id: int, entity: Channel, logo_path: str
    ) -> TelegramChat:
        try:
            chat = self.get(chat_id=chat_id)
            return self.update(entity, chat, logo_path=logo_path)
        except NoResultFound:
            logger.debug(
                f"No Telegram Chat for ID {entity.id!r} found. Creating new Telegram Chat."
            )
            return self.create(chat_id=chat_id, entity=entity, logo_path=logo_path)

    def get(self, chat_id: int) -> TelegramChat:
        return (
            self.db_session.query(TelegramChat).filter(TelegramChat.id == chat_id).one()
        )

    def get_all(self, chat_ids: list[int] | None = None) -> list[TelegramChat]:
        query = self.db_session.query(TelegramChat)
        if chat_ids:
            query = query.filter(TelegramChat.id.in_(chat_ids))

        query = query.order_by(TelegramChat.id)
        return query.all()

    def get_all_managed(self, user_id: int) -> list[TelegramChat]:
        query = self.db_session.query(TelegramChat)
        query = query.join(
            TelegramChatUser, TelegramChat.id == TelegramChatUser.chat_id
        )
        query = query.filter(
            TelegramChatUser.user_id == user_id, TelegramChatUser.is_admin.is_(True)
        )
        query = query.order_by(TelegramChat.id)
        return query.all()

    def refresh_invite_link(self, chat_id: int, invite_link: str) -> TelegramChat:
        chat = self.get(chat_id)
        chat.invite_link = invite_link
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat.title!r} invite link updated.")
        return chat

    def get_by_slug(self, slug: str) -> TelegramChat:
        return (
            self.db_session.query(TelegramChat).filter(TelegramChat.slug == slug).one()
        )

    def delete(self, chat_id: int) -> None:
        self.db_session.query(TelegramChat).filter(TelegramChat.id == chat_id).delete(
            synchronize_session="fetch"
        )
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat_id!r} deleted.")

    def check_exists(self, chat_id: int) -> bool:
        return (
            self.db_session.query(TelegramChat)
            .filter(TelegramChat.id == chat_id)
            .count()
            > 0
        )

    def set_logo(self, chat_id: int, logo_path: str) -> None:
        """
        Updates the logo path for a specified Telegram chat in the database by its
        chat ID. Commits the changes to the database and logs the operation.

        :param chat_id: The unique identifier of the Telegram chat.
        :param logo_path: The file path of the logo to be set.
        :return: None
        """
        self.db_session.query(TelegramChat).filter(TelegramChat.id == chat_id).update(
            {"logo_path": logo_path}
        )
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat_id!r} logo set.")

    def clear_logo(self, chat_id: int) -> None:
        chat = self.get(chat_id)
        chat.logo_path = None
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat.title!r} logo cleared.")
