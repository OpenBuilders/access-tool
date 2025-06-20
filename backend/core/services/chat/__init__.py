import logging
import random
from string import ascii_lowercase

from slugify import slugify
from sqlalchemy.exc import NoResultFound
from telethon.tl.types import Channel

from core.models.chat import TelegramChat, TelegramChatUser

from core.services.base import BaseService

logger = logging.getLogger(__name__)


DEFAULT_SLUG_SUFFIX_LENGTH = 6
MAX_SLUG_SUFFIX_ATTEMPTS = 5


class TelegramChatService(BaseService):
    def _get_unique_slug(self, title: str) -> str:
        """
        Generates a unique slug for a given title by appending a random suffix if necessary.

        This function ensures the generated slug does not conflict with
        existing slugs retrieved from the database. If the initial slug
        based on the given title already exists, it continues appending
        randomly generated suffixes to ensure uniqueness. The function
        raises an error if it exhausts the maximum allowed attempts to
        generate a unique slug.

        :param title: The title to generate a unique slug for.
        :return: A unique slug for the given title.
        :raises ValueError: If a unique slug cannot be generated after the maximum
                            number of attempts.
        """
        initial_slug = slug = slugify(title)
        chats = self.get_all_by_slug(slug=slug)
        chat_slugs = {chat.slug for chat in chats}
        attempts = 0
        while slug in chat_slugs:
            if attempts >= MAX_SLUG_SUFFIX_ATTEMPTS:
                raise ValueError(
                    f"Could not generate a unique slug for {title!r} after {MAX_SLUG_SUFFIX_ATTEMPTS} attempts."
                )

            slug = f"{initial_slug}-{''.join(random.choices(ascii_lowercase, k=DEFAULT_SLUG_SUFFIX_LENGTH))}"
            attempts += 1
        logger.debug(f"Generated slug {slug!r} for {title!r}.")
        return slug

    def create(self, chat_id: int, entity: Channel, logo_path: str) -> TelegramChat:
        chat = TelegramChat(
            id=chat_id,
            username=entity.username,
            title=entity.title,
            is_forum=entity.forum,
            logo_path=logo_path,
            insufficient_privileges=False,
            slug=self._get_unique_slug(entity.title),
        )
        self.db_session.add(chat)
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat.title!r} created.")
        return chat

    def update(
        self, entity: Channel, chat: TelegramChat, logo_path: str
    ) -> TelegramChat:
        chat.username = entity.username
        if entity.title != chat.title:
            chat.title = entity.title
            chat.slug = self._get_unique_slug(entity.title)
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

    def get_all_by_slug(self, slug: str) -> list[TelegramChat]:
        return (
            self.db_session.query(TelegramChat)
            .filter(TelegramChat.slug.ilike(f"%{slug}%"))
            .order_by(TelegramChat.id)
            .all()
        )

    def get_all(
        self,
        chat_ids: list[int] | None = None,
        enabled_only: bool = False,
        sufficient_privileges_only: bool = False,
    ) -> list[TelegramChat]:
        query = self.db_session.query(TelegramChat)
        if chat_ids:
            query = query.filter(TelegramChat.id.in_(chat_ids))

        if enabled_only:
            query = query.filter(TelegramChat.is_enabled.is_(True))

        if sufficient_privileges_only:
            query = query.filter(TelegramChat.insufficient_privileges.is_(False))

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
        chat.is_enabled = True
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

    def set_title(self, chat_id: int, title: str) -> None:
        """
        Updates the title for a specified Telegram chat in the database by its
        chat ID. Commits the changes to the database and logs the operation.
        """
        self.db_session.query(TelegramChat).filter(TelegramChat.id == chat_id).update(
            {"title": title}
        )
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat_id!r} title set.")

    def clear_logo(self, chat_id: int) -> None:
        chat = self.get(chat_id)
        chat.logo_path = None
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat.title!r} logo cleared.")

    def enable(self, chat: TelegramChat) -> TelegramChat:
        chat.is_enabled = True
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat.title!r} enabled.")
        return chat

    def disable(self, chat: TelegramChat) -> TelegramChat:
        chat.invite_link = None
        chat.is_enabled = False
        self.db_session.commit()
        logger.debug(f"Telegram Chat {chat.title!r} disabled.")
        return chat

    def count(self) -> int:
        return self.db_session.query(TelegramChat).count()
