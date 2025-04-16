import logging
from abc import ABC

from sqlalchemy import desc

from core.dtos.chat.rules.nft import (
    CreateTelegramChatNFTCollectionRuleDTO,
    UpdateTelegramChatNFTCollectionRuleDTO,
)
from core.dtos.chat.rules.jetton import (
    CreateTelegramChatJettonRuleDTO,
    UpdateTelegramChatJettonRuleDTO,
)
from core.dtos.chat.rules.toncoin import (
    CreateTelegramChatToncoinRuleDTO,
    UpdateTelegramChatToncoinRuleDTO,
)
from core.models import TelegramChatJetton, TelegramChatNFTCollection
from core.models.rule import TelegramChatToncoin
from core.services.base import BaseService


logger = logging.getLogger(__name__)


TelegramChatRuleType = TelegramChatJetton | TelegramChatNFTCollection
CreateTelegramChatRuleDTOType = (
    CreateTelegramChatJettonRuleDTO
    | CreateTelegramChatNFTCollectionRuleDTO
    | CreateTelegramChatToncoinRuleDTO
)
UpdateTelegramChatRuleDTOType = (
    UpdateTelegramChatJettonRuleDTO
    | UpdateTelegramChatNFTCollectionRuleDTO
    | UpdateTelegramChatToncoinRuleDTO
)


class TelegramChatBlockchainRuleBaseService(BaseService, ABC):
    model: type[TelegramChatRuleType]

    def create(self, dto: CreateTelegramChatRuleDTOType) -> TelegramChatRuleType:
        new_rule = self.model(**dto.model_dump())
        self.db_session.add(new_rule)
        self.db_session.commit()
        logger.debug(f"Telegram Chat Rule {new_rule!r} created.")
        return new_rule

    def get(self, id_: int, chat_id: int) -> TelegramChatRuleType:
        return (
            self.db_session.query(self.model)
            .filter(self.model.id == id_, self.model.chat_id == chat_id)
            .one()
        )

    def update(
        self,
        rule: TelegramChatRuleType,
        dto: UpdateTelegramChatRuleDTOType,
    ) -> TelegramChatRuleType:
        for key, value in dto.model_dump().items():
            setattr(rule, key, value)
        self.db_session.commit()
        logger.debug(f"{rule!r} updated.")
        return rule

    def get_all(
        self, chat_id: int | None = None, enabled_only: bool = True
    ) -> list[TelegramChatRuleType]:
        query = self.db_session.query(self.model)
        if chat_id is not None:
            query = query.filter(self.model.chat_id == chat_id)

        if enabled_only:
            query = query.filter(self.model.is_enabled.is_(True))

        query = query.order_by(desc(self.model.is_enabled), self.model.created_at)
        return query.all()

    def delete(self, rule_id: int, chat_id: int) -> None:
        self.db_session.query(self.model).filter(
            self.model.id == rule_id, self.model.chat_id == chat_id
        ).delete(synchronize_session="fetch")
        self.db_session.commit()
        logger.debug(
            f"Telegram Chat Rule {self.model.__name__!r} {rule_id=!r} deleted."
        )


class TelegramChatJettonService(TelegramChatBlockchainRuleBaseService):
    model = TelegramChatJetton


class TelegramChatNFTCollectionService(TelegramChatBlockchainRuleBaseService):
    model = TelegramChatNFTCollection


class TelegramChatToncoinService(TelegramChatBlockchainRuleBaseService):
    model = TelegramChatToncoin
