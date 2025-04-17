from typing import Self, Any

from pydantic import BaseModel


class BaseTelegramChatDTO(BaseModel):
    id: int
    username: str | None
    title: str
    description: str | None
    slug: str
    is_forum: bool
    logo_path: str | None
    insufficient_privileges: bool
    members_count: int | None


class TelegramChatDTO(BaseTelegramChatDTO):
    @classmethod
    def from_object(
        cls,
        obj: Any,
        insufficient_privileges: bool | None = None,
        members_count: int | None = None,
    ) -> Self:
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
        )


class TelegramChatPovDTO(BaseTelegramChatDTO):
    join_url: str | None
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
            insufficient_privileges=obj.insufficient_privileges,
            members_count=members_count,
        )
