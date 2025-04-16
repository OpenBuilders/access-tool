from typing import Any, Self, Annotated

from pydantic import Field

from api.pos.base import BaseFDO


class UserFDO(BaseFDO):
    id: int
    first_name: str
    last_name: str | None = None
    username: str | None = None
    is_premium: bool = False
    language_code: str
    photo_url: str | None = None
    wallets: list[str]

    @classmethod
    def from_orm(cls, obj: Any) -> Self:
        return cls(
            id=obj.id,
            first_name=obj.first_name,
            last_name=obj.last_name,
            username=obj.username,
            is_premium=obj.is_premium,
            language_code=obj.language,
            photo_url=None,
            wallets=[w.address for w in obj.wallets],
        )


class UpdateUserWalletFDO(BaseFDO):
    user: UserFDO
    task_id: Annotated[
        str | None,
        Field(
            ...,
            description=(
                "ID of the wallet update task that has to be awaited, which means that wallet details are being refreshed. "
                "If `null` returned - no need to wait for a task to be completed"
            ),
        ),
    ]
