from pathlib import Path

from pydantic import field_validator

from core.constants import (
    DEFAULT_BATCH_PROCESSING_SIZE,
    DEFAULT_TELEGRAM_BATCH_PROCESSING_SIZE,
    DEFAULT_TELEGRAM_BATCH_REQUEST_SIZE,
)
from core.settings import CoreSettings


class IndexerSettings(CoreSettings):
    worker_concurrency: int = 5

    sticker_dom_private_key_path: str | Path
    sticker_dom_base_url: str
    sticker_dom_data_storage_base_url: str
    sticker_dom_consumer_id: int
    sticker_dom_ownership_header_key: str | None = None
    sticker_dom_ownership_header_value: str | None = None
    sticker_dom_batch_processing_size: int = DEFAULT_BATCH_PROCESSING_SIZE

    telegram_batch_processing_size: int = DEFAULT_TELEGRAM_BATCH_PROCESSING_SIZE
    telegram_batch_request_size: int = DEFAULT_TELEGRAM_BATCH_REQUEST_SIZE

    telegram_indexer_session_path: Path

    @classmethod
    @field_validator("telegram_indexer_session_path", mode="after")
    def validate_telegram_session_path(cls, value: Path) -> Path:
        if not value.parent.exists() or not value.parent.is_dir():
            raise ValueError(f"Provided path {value} should have a parent existing")

        return value


indexer_settings = IndexerSettings()
