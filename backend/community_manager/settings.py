from pathlib import Path

from core.settings import CoreSettings

from pydantic import field_validator


class CommunityManagerSettings(CoreSettings):
    ton_api_key: str

    telegram_session_path: Path

    @classmethod
    @field_validator("telegram_session_path", mode="after")
    def validate_telegram_session_path(cls, value: Path) -> Path:
        if not value.parent.exists() or not value.parent.is_dir():
            raise ValueError(f"Provided path {value} should have a parent existing")

        return value

    worker_concurrency: int = 1
    enable_manager: bool
    items_per_task: int = 100


community_manager_settings = CommunityManagerSettings()
