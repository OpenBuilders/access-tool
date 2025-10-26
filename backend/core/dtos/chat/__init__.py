from typing import Self, Any

from pydantic import BaseModel

from core.dtos.pagination import PaginatedResultDTO, OrderingRuleDTO
from core.enums.chat import CustomTelegramChatOrderingRulesEnum


class TelegramChatPreviewDTO(BaseModel):
    id: int
    title: str
    description: str | None
    slug: str
    is_forum: bool
    logo_path: str | None
    members_count: int
    tcv: float

    @classmethod
    def from_object(cls, obj: Any, members_count: int, tcv: float) -> Self:
        return cls(
            id=obj.id,
            title=obj.title,
            description=obj.description,
            slug=obj.slug,
            is_forum=obj.is_forum,
            logo_path=obj.logo_path,
            members_count=members_count,
            tcv=tcv,
        )


class BaseTelegramChatDTO(TelegramChatPreviewDTO):
    username: str | None
    is_enabled: bool
    join_url: str | None = None


class TelegramChatDTO(BaseTelegramChatDTO):
    insufficient_privileges: bool

    @classmethod
    def from_object(
        cls,
        obj: Any,
        insufficient_privileges: bool | None = None,
        members_count: int | None = None,
    ) -> Self:
        """
        Creates an instance of the class from an existing object with specified overrides.

        This method is used to create a new instance of the class using the data provided
        in the given object. It allows overriding certain fields, while the others will
        be inherited directly from the input object. This functionality is especially
        helpful in situations where a partial state modification of an object is required.

        :param obj: The input object that serves as the source of data
        :param insufficient_privileges: Boolean value indicating privilege status,
            overriding the original value from the input object if provided
        :param members_count: Optional integer value to override the number of members in the object
        :return: A new instance of the class with the updated or inherited attributes
        """
        # Allows overwriting that value when there is no predefined one
        if insufficient_privileges is None:
            insufficient_privileges = obj.insufficient_privileges

        return cls(
            id=obj.id,
            username=obj.username,
            title=obj.title,
            description=obj.description,
            slug=obj.slug,
            is_forum=obj.is_forum,
            logo_path=obj.logo_path,
            insufficient_privileges=insufficient_privileges,
            members_count=members_count,
            is_enabled=obj.is_enabled,
            join_url=obj.invite_link,
        )


class TelegramChatPovDTO(BaseTelegramChatDTO):
    is_member: bool
    is_eligible: bool

    @classmethod
    def from_object(
        cls,
        obj: Any,
        is_member: bool,
        is_eligible: bool,
        join_url: str | None,
        members_count: int | None = None,
    ) -> Self:
        """
        Creates an instance of the class based on the attributes of a given object.
        This method essentially encapsulates the logic of building an instance based
        on the provided parameters, taking into account the state of the input object
        and conditional attributes supplied. It determines whether to populate the
        instance with valid data or default placeholder values.

        :param obj: The source object containing data to populate the class instance.
        :param is_member: Indicates whether the object belongs to the member category.
        :param is_eligible: Specifies whether the object meets eligibility criteria.
        :param join_url: Optional URL for joining the object. Can be None.
        :param members_count: Optional count of members associated with the object.
            Defaults to None.
        :return: An instance of the class populated with data from the source object or
            default placeholder values when criteria are not met.
        """
        if obj.is_enabled:
            return cls(
                id=obj.id,
                username=obj.username,
                title=obj.title,
                description=obj.description,
                slug=obj.slug,
                is_forum=obj.is_forum,
                logo_path=obj.logo_path,
                is_member=is_member,
                is_eligible=is_eligible,
                join_url=join_url,
                members_count=members_count,
                is_enabled=obj.is_enabled,
            )
        else:
            return cls(
                id=-1,
                username=None,
                title=obj.slug,
                description=None,
                slug=obj.slug,
                is_forum=False,
                logo_path=None,
                is_member=False,
                members_count=-1,
                is_enabled=obj.is_enabled,
                is_eligible=False,
                join_url=None,
            )


class PaginatedTelegramChatsPreviewDTO(PaginatedResultDTO[TelegramChatPreviewDTO]):
    ...


class TelegramChatOrderingRuleDTO(OrderingRuleDTO[CustomTelegramChatOrderingRulesEnum]):
    ...
