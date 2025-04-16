from typing import Self

from pydantic import BaseModel
from telethon.tl.types import User as TelethonUser

from core.settings import core_settings


class UserInitDataPO(BaseModel):
    id: int
    username: str | None = None
    photo_url: str | None = None
    last_name: str | None = None
    first_name: str
    language_code: str
    is_premium: bool = False
    allow_write_to_pm: bool = True

    class Config:
        extra = "ignore"


class TelegramUserDTO(BaseModel):
    id: int
    first_name: str
    last_name: str | None = None
    username: str | None = None
    is_premium: bool
    language_code: str
    photo_url: str | None = None
    allow_write_to_pm: bool = True

    @classmethod
    def from_init_data(cls, user_data: UserInitDataPO) -> Self:
        return cls(
            id=user_data.id,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            username=user_data.username,
            is_premium=user_data.is_premium,
            language_code=user_data.language_code,
            photo_url=user_data.photo_url,
            allow_write_to_pm=user_data.allow_write_to_pm,
        )

    @classmethod
    def from_telethon_user(cls, user: TelethonUser) -> Self:
        if user.bot:
            raise ValueError(f"Serialized user is a bot: {user.stringify()}")
        return cls(
            id=user.id,
            first_name=user.first_name or "",
            last_name=user.last_name,
            username=user.username,
            is_premium=user.premium or False,
            language_code=user.lang_code or core_settings.default_language,
            photo_url=None,
            allow_write_to_pm=True,
        )
