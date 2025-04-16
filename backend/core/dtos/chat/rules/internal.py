from pydantic import BaseModel, computed_field

from core.dtos.chat.rules import EligibilityCheckType
from core.enums.nft import NftCollectionAsset


class EligibilitySummaryInternalDTO(BaseModel):
    """
    Used for internal purposes to check if chat is eligible for promotion
    """

    id: int
    type: EligibilityCheckType
    title: str
    address_raw: str | None = None  # required for blockchain rules only
    actual: float | int = 0.0
    expected: float | int
    is_enabled: bool
    asset: NftCollectionAsset | None = None
    category: str | None = None

    @property
    def address(self):
        if not self.address_raw:
            return None
        return self.address_raw

    @computed_field(return_type=bool)
    def is_eligible(self):
        return self.actual >= self.expected

    def __repr__(self):
        return (
            f"<{self.__class__.__name__} "
            f"{self.type} "
            f"{self.category=} "
            f"{self.title=} "
            f"{self.address=} "
            f"{self.actual=} "
            f"{self.expected=}>"
        )


class RulesEligibilitySummaryInternalDTO(BaseModel):
    """
    Used for internal purposes to check if chat is eligible for promotion
    """

    items: list[EligibilitySummaryInternalDTO]
    wallet: str | None = None
    is_admin: bool

    def __bool__(self):
        return all(item.is_eligible for item in self.items)

    def __repr__(self):
        return f"<{self.__class__.__name__} ({self.items=}) {self.is_admin=}>"
