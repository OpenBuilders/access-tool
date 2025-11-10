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
        authentication_string: str = ""
        if self.redis_username and self.redis_password:
            authentication_string = f"{self.redis_username}:{self.redis_password}@"
        return f"redis://{authentication_string}{self.redis_host}:{self.redis_port}/{self.redis_db}"

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

    @property
    def blacklisted_wallets(self):
        if self._blacklisted_wallets is None:
            with open(STATIC_PATH / "blacklisted_wallets.txt") as f:
                self._blacklisted_wallets = f.read().splitlines()

        return self._blacklisted_wallets

    _whitelisted_gift_collections: list[str] | None = None

    @property
    def whitelisted_gift_collections(self):
        if self._whitelisted_gift_collections is None:
            with open(STATIC_PATH / "whitelisted_gift_collections.txt") as f:
                self._whitelisted_gift_collections = f.read().splitlines()

        return self._whitelisted_gift_collections

    beat_schedule_filename: str = "/tmp/celerybeat-schedule"

    env: str = "development"

    cdn_access_key: str
    cdn_secret_key: str
    cdn_endpoint: str
    cdn_region: str = "auto"
    cdn_bucket_name: str

    ton_api_key: str


core_settings = CoreSettings()
