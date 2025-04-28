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

    mysql_host: str
    mysql_port: int
    mysql_database: str
    mysql_user: str
    mysql_password: str
    mysql_root_password: str

    @property
    def db_connection_string(self):
        return f"mysql+mysqlconnector://{self.mysql_user}:{self.mysql_password}@{self.mysql_host}:{self.mysql_port}/{self.mysql_database}"

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
