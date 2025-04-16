import logging
import re
from collections.abc import Callable
from typing import Annotated, Self

from pydantic import (
    BaseModel,
    AfterValidator,
    field_validator,
    field_serializer,
    Field,
    AnyHttpUrl,
    model_validator,
)
from pytonapi.utils import to_nano, to_amount, raw_to_userfriendly

from api.pos.base import BaseFDO
from core.dtos.chat import (
    BaseTelegramChatDTO,
    TelegramChatDTO,
)
from core.dtos.chat.rules import (
    EligibilityCheckType,
    ChatEligibilityRuleDTO,
    TelegramChatWithRulesDTO,
)
from core.dtos.chat.rules.summary import (
    RuleEligibilitySummaryDTO,
    TelegramChatWithEligibilitySummaryDTO,
)
from core.dtos.chat.rules.whitelist import WhitelistRuleDTO, WhitelistRuleExternalDTO
from core.dtos.chat.rules.nft import NftEligibilityRuleDTO, NftRuleEligibilitySummaryDTO
from core.dtos.base import NftItemAttributeDTO
from core.enums.jetton import CurrencyCategory
from core.enums.nft import (
    NftCollectionAsset,
    NftCollectionCategoryType,
    ASSET_TO_CATEGORY_TYPE_MAPPING,
)

logger = logging.getLogger(__name__)

CHAT_INPUT_REGEX = re.compile(
    r"^(?P<chat_id>-?\d+(\.\d+)?)|^(https:\/\/t\.me\/(?P<username>[a-zA-Z0-9_]{4,32}))$"
)


class BaseTelegramChatFDO(BaseFDO, BaseTelegramChatDTO):
    ...


class TelegramChatCPO(BaseModel):
    full: bool = False


class TelegramChatFDO(BaseFDO, TelegramChatDTO):
    ...


def validate_chat_identifier(v: str) -> str | int:
    match = CHAT_INPUT_REGEX.match(str(v))
    if not match:
        raise ValueError("Invalid chat input: must be chat ID or username")

    if match.group("username"):
        return match.group("username")

    return int(match.group("chat_id"))


def validate_address(is_required: bool) -> Callable[[str | None], str | None]:
    def _inner(v: str | None) -> str | None:
        if not v:
            if is_required:
                raise ValueError("Missing blockchain address")
            return v

        try:
            # Only to test if the format is valid
            raw_to_userfriendly(v)
        except ValueError:
            logger.warning(f"Invalid blockchain address: {v!r}")
            raise ValueError("Invalid blockchain address")
        except Exception as e:
            logger.warning(f"Invalid blockchain address: {e}", exc_info=True)
            raise ValueError("Invalid blockchain address")

        return v

    return _inner


class AddChatCPO(BaseFDO):
    chat_identifier: Annotated[str | int, AfterValidator(validate_chat_identifier)]


class EditChatCPO(BaseFDO):
    description: str | None


class BaseTelegramChatQuantityRuleCPO(BaseFDO):
    expected: Annotated[float | int, Field(..., gt=0, description="Expected value")]
    category: Annotated[
        str | None,
        Field(
            None,
            description="Optional category of the rule, e.g. NFT collection category or amount of burned items",
        ),
    ]
    is_enabled: bool = True


class BaseTelegramChatBlockchainResourceRuleCPO(BaseTelegramChatQuantityRuleCPO):
    address: Annotated[
        str,
        Field(..., description="Raw blockchain address of the item, e.g. 0:..."),
        AfterValidator(validate_address(True)),
    ]


class TelegramChatToncoinRuleCPO(BaseTelegramChatQuantityRuleCPO):
    category: CurrencyCategory = CurrencyCategory.BALANCE

    @field_validator("expected")
    @classmethod
    def preprocess_expected(cls, v: float | int) -> float | int:
        if not v:
            return v

        return to_nano(v)


class TelegramChatJettonRuleCPO(BaseTelegramChatBlockchainResourceRuleCPO):
    category: CurrencyCategory = CurrencyCategory.BALANCE

    @field_validator("expected")
    @classmethod
    def preprocess_expected(cls, v: float | int) -> float | int:
        if not v:
            return v

        return to_nano(v)


class NftItemAttributeFDO(BaseFDO, NftItemAttributeDTO):
    ...


class TelegramChatNFTCollectionRuleCPO(BaseTelegramChatBlockchainResourceRuleCPO):
    address: Annotated[
        str | None,
        Field(None, description="Raw blockchain address of the item, e.g. 0:..."),
        AfterValidator(validate_address(is_required=False)),
    ]
    category: NftCollectionCategoryType | None = None
    asset: NftCollectionAsset | None = None

    @model_validator(mode="after")
    def validate_address_and_asset(self) -> Self:
        """
        Validates the mutually exclusive condition of the `address` and `asset` attributes.

        Ensures that either the `address` or the `asset` attribute is specified, but not both.
        Raises a ValueError if the condition is violated.

        :raises ValueError: If both `address` and `asset` are specified or if neither is specified
        """
        if (self.address is None) == (self.asset is None):
            raise ValueError("Either address or asset must be specified, but not both")

        return self

    @model_validator(mode="after")
    def validate_category_and_asset(self) -> Self:
        """
        Validates the logical consistency between the `category` and `asset` attributes
        of the model after its initialization or modification. Ensures that if an
        `asset` is provided, a corresponding valid `category` is specified and matches
        the expected type.

        :raises ValueError: If `category` is None when `asset` is specified.
        :raises ValueError: If `category` does not match the expected type as defined
            in the mapping `ASSET_TO_CATEGORY_TYPE_MAPPING`.
        """
        if not self.asset:
            return self

        if self.category is None:
            raise ValueError("Category must be specified if asset is provided")

        try:
            self.category = ASSET_TO_CATEGORY_TYPE_MAPPING[self.asset](
                self.category.value
            )
        except ValueError:
            raise ValueError("Category does not match asset")

        return self


class TelegramChatPremiumRuleCPO(BaseFDO):
    is_enabled: bool


class ChatEligibilityRuleFDO(BaseFDO, ChatEligibilityRuleDTO):
    @field_serializer("expected", return_type=float | int)
    def preprocess_expected(self, v: int) -> float | int:
        if not v or self.type not in (
            EligibilityCheckType.JETTON,
            EligibilityCheckType.TONCOIN,
        ):
            return v

        return to_amount(v)


class NftEligibilityRuleFDO(BaseFDO, NftEligibilityRuleDTO):
    ...


class NftRuleEligibilitySummaryFDO(BaseFDO, NftRuleEligibilitySummaryDTO):
    ...


class TelegramChatWithRulesFDO(BaseFDO):
    chat: TelegramChatFDO
    rules: list[ChatEligibilityRuleFDO | NftEligibilityRuleFDO]

    @classmethod
    def from_dto(cls, dto: TelegramChatWithRulesDTO) -> Self:
        mapping = {
            EligibilityCheckType.NFT_COLLECTION: NftEligibilityRuleFDO,
        }
        return cls(
            chat=TelegramChatFDO.model_validate(dto.chat.model_dump()),
            rules=[
                mapping.get(rule.type, ChatEligibilityRuleFDO).model_validate(
                    rule.model_dump()
                )
                for rule in dto.rules
            ],
        )


class RuleEligibilitySummaryFDO(BaseFDO, RuleEligibilitySummaryDTO):
    # TODO it should parse actual the same way as it stores it in nano in the database
    @field_serializer("expected", return_type=float | int)
    def preprocess_expected(self, v: int) -> float | int:
        if not v or self.type not in (
            EligibilityCheckType.JETTON,
            EligibilityCheckType.TONCOIN,
        ):
            return v

        return to_amount(v)


class TelegramChatWithEligibilitySummaryFDO(BaseFDO):
    """
    Chat with eligibility rules. Returns not only chat and rules data,
    but whether user is eligible for chat
    """

    chat: TelegramChatFDO
    rules: list[RuleEligibilitySummaryFDO | NftRuleEligibilitySummaryFDO]
    wallet: str | None

    @classmethod
    def from_dto(cls, dto: TelegramChatWithEligibilitySummaryDTO) -> Self:
        mapping = {
            EligibilityCheckType.NFT_COLLECTION: NftRuleEligibilitySummaryFDO,
        }
        return cls(
            chat=TelegramChatFDO.model_validate(dto.chat.model_dump()),
            rules=[
                mapping.get(rule.type, RuleEligibilitySummaryFDO).model_validate(
                    rule.model_dump()
                )
                for rule in dto.rules
            ],
            wallet=dto.wallet,
        )


class CreateWhitelistRuleBaseCPO(BaseFDO):
    name: Annotated[str, Field(min_length=1, max_length=255)]
    description: Annotated[str | None, Field(min_length=0, max_length=255)] = None


class CreateWhitelistRuleCPO(CreateWhitelistRuleBaseCPO):
    users: list[int]


class CreateWhitelistRuleExternalCPO(CreateWhitelistRuleBaseCPO):
    url: AnyHttpUrl


class UpdateWhitelistRuleCPO(CreateWhitelistRuleCPO):
    is_enabled: bool


class UpdateWhitelistRuleExternalCPO(CreateWhitelistRuleExternalCPO):
    is_enabled: bool


class WhitelistRuleFDO(BaseFDO, WhitelistRuleDTO):
    ...


class WhitelistRuleExternalFDO(BaseFDO, WhitelistRuleExternalDTO):
    ...
