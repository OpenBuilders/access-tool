from typing import Self

from pydantic import BaseModel

from core.dtos.chat import TelegramChatDTO
from core.dtos.chat.rules import ChatEligibilityRuleDTO
from core.dtos.chat.rules.internal import EligibilitySummaryInternalDTO
from core.dtos.chat.rules.nft import NftRuleEligibilitySummaryDTO


class RuleEligibilitySummaryDTO(ChatEligibilityRuleDTO):
    actual: float | None = None
    is_eligible: bool = False

    @classmethod
    def from_internal_dto(cls, internal_dto: EligibilitySummaryInternalDTO) -> Self:
        return cls(
            id=internal_dto.id,
            type=internal_dto.type,
            category=internal_dto.category,
            asset=internal_dto.asset,
            title=internal_dto.title,
            expected=internal_dto.expected,
            photo_url=None,
            blockchain_address=internal_dto.address,
            is_enabled=internal_dto.is_enabled,
            actual=internal_dto.actual,
            is_eligible=internal_dto.is_eligible,  # type: ignore
        )


class TelegramChatWithEligibilitySummaryDTO(BaseModel):
    chat: TelegramChatDTO
    rules: list[RuleEligibilitySummaryDTO | NftRuleEligibilitySummaryDTO]
    wallet: str | None = None
