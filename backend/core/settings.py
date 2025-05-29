from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from core.constants import STATIC_PATH


class CoreSettings(BaseSettings):
    redis_host: str
    redis_port: int
    redis_db: int
    redis_transaction_db: int
    redis_username: str | None = None
    redis_password: str | None = None
    redis_transaction_stream_name: str

    @property
    def broker_url(self):
        return f"redis://{self.redis_host}:{self.redis_port}/{self.redis_db}"

    sql_host: str
    sql_port: int
    sql_database: str
    sql_user: str
    sql_password: str
    sql_driver: str

    @property
    def db_connection_string(self):
        return f"{self.sql_driver}://{self.sql_user}:{self.sql_password}@{self.sql_host}:{self.sql_port}/{self.sql_database}"

    telegram_bot_token: str
    telegram_app_id: int
    telegram_app_hash: str

    default_language: str = "en"

    model_config = SettingsConfigDict(
        case_sensitive=False,
        validate_default=True,
    )
    redis_task_status_expiration: int = 300

    _blacklisted_wallets: list[str] | None = None

    telegram_indexer_session_path: Path

    @classmethod
    @field_validator("telegram_indexer_session_path", mode="after")
    def validate_telegram_session_path(cls, value: Path) -> Path:
        if not value.parent.exists() or not value.parent.is_dir():
            raise ValueError(f"Provided path {value} should have a parent existing")

        return value

    @property
    def blacklisted_wallets(self):
        if self._blacklisted_wallets is not None:
            return self._blacklisted_wallets

        with open(STATIC_PATH / "blacklisted_wallets.txt") as f:
            self._blacklisted_wallets = f.read().splitlines()

        return self._blacklisted_wallets

    beat_schedule_filename: str = "/tmp/celerybeat-schedule"

    env: str = "development"

    cdn_access_key: str
    cdn_secret_key: str
    cdn_endpoint: str
    cdn_region: str = "auto"
    cdn_bucket_name: str

    ton_api_key: str


core_settings = CoreSettings()
