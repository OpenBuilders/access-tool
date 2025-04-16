from pydantic import BaseModel

from core.enums.jetton import CurrencyCategory


class BaseTelegramChatJettonRuleDTO(BaseModel):
    address: str
    category: CurrencyCategory | None
    threshold: int
    is_enabled: bool


class CreateTelegramChatJettonRuleDTO(BaseTelegramChatJettonRuleDTO):
    chat_id: int


class UpdateTelegramChatJettonRuleDTO(BaseTelegramChatJettonRuleDTO):
    ...
