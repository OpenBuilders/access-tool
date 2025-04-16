import logging
from typing import TypeVar, Generic

from sqlalchemy import desc

from core.models import TelegramChatWhitelistExternalSource, TelegramChatWhitelist
from core.services.base import BaseService


logger = logging.getLogger(__name__)


TelegramChatWhitelistBaseT = TypeVar(
    "TelegramChatWhitelistBaseT",
    bound=TelegramChatWhitelistExternalSource | TelegramChatWhitelist,
)


class BaseTelegramChatExternalSourceService(
    BaseService, Generic[TelegramChatWhitelistBaseT]
):
    model: TelegramChatWhitelistBaseT

    def get(self, rule_id: int, chat_id: int) -> TelegramChatWhitelistBaseT:
        return (
            self.db_session.query(self.model)
            .filter(self.model.id == rule_id, self.model.chat_id == chat_id)
            .one()
        )

    def get_all(
        self, chat_id: int | None = None, enabled_only: bool = True
    ) -> list[TelegramChatWhitelistBaseT]:
        query = self.db_session.query(self.model)
        if chat_id is not None:
            query = query.filter(self.model.chat_id == chat_id)
        if enabled_only:
            query = query.filter(self.model.is_enabled.is_(True))
        return query.order_by(
            desc(self.model.is_enabled), desc(self.model.created_at)
        ).all()

    def set_content(
        self, rule: TelegramChatWhitelistBaseT, content: list[int]
    ) -> TelegramChatWhitelistBaseT:
        rule.content = content
        self.db_session.commit()
        return rule

    def delete(self, chat_id: int, rule_id: int) -> None:
        self.db_session.query(self.model).filter(
            self.model.chat_id == chat_id, self.model.id == rule_id
        ).delete(synchronize_session="fetch")
        self.db_session.commit()
        logger.debug(f"Telegram Chat External Source {rule_id!r} deleted.")


class TelegramChatExternalSourceService(
    BaseTelegramChatExternalSourceService[TelegramChatWhitelistExternalSource]
):
    model = TelegramChatWhitelistExternalSource

    def create(
        self, chat_id: int, name: str, description: str, external_source_url: str
    ) -> TelegramChatWhitelistExternalSource:
        """
        Warning: This method does not commit the transaction as it could be reverted if the external source is invalid.
        :param chat_id: the chat id
        :param name: the name of the external source
        :param description: the description of the external source
        :param external_source_url: the external source url
        :return: the created external source
        """
        new_source = self.model(
            chat_id=chat_id,
            url=external_source_url,
            name=name,
            description=description,
        )
        self.db_session.add(new_source)
        return new_source

    def update(
        self,
        chat_id: int,
        rule_id: int,
        name: str,
        description: str,
        external_source_url: str,
        is_enabled: bool,
    ) -> TelegramChatWhitelistExternalSource:
        """
        Warning: This method does not commit the transaction as it could be reverted if the external source is invalid.
        :param chat_id: the chat id
        :param rule_id: the rule id
        :param name: the name of the external source
        :param description: the description of the external source
        :param external_source_url: the external source url
        :param is_enabled: whether the external source is enabled
        :return: the updated external source
        """
        source = self.get(chat_id=chat_id, rule_id=rule_id)
        source.url = external_source_url
        source.name = name
        source.description = description
        source.is_enabled = is_enabled
        return source


class TelegramChatWhitelistService(
    BaseTelegramChatExternalSourceService[TelegramChatWhitelist]
):
    model = TelegramChatWhitelist

    def create(
        self, chat_id: int, name: str, description: str | None
    ) -> TelegramChatWhitelist:
        new_source = self.model(
            chat_id=chat_id,
            name=name,
            description=description,
        )
        self.db_session.add(new_source)
        self.db_session.commit()
        return new_source

    def update(
        self,
        chat_id: int,
        rule_id: int,
        name: str,
        description: str | None,
        is_enabled: bool,
    ) -> TelegramChatWhitelist:
        source = self.get(chat_id=chat_id, rule_id=rule_id)
        source.name = name
        source.description = description
        source.is_enabled = is_enabled
        self.db_session.commit()
        return source
