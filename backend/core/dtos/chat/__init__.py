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
    insufficient_privileges: bool = False

    @classmethod
    def from_orm(cls, obj: Any) -> Self:
        return cls(
            id=obj.id,
            username=obj.username,
            title=obj.title,
            description=obj.description,
            slug=obj.slug,
            is_forum=obj.is_forum,
            logo_path=obj.logo_path,
        )


class TelegramChatDTO(BaseTelegramChatDTO):
    join_url: str | None = None
    is_member: bool = False
    is_eligible: bool = False

    @classmethod
    def from_object(
        cls, obj: Any, is_member: bool, is_eligible: bool, join_url: str | None
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
        )
