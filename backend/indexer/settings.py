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

    telegram_indexer_session_path: Path | None = None

    @field_validator("telegram_indexer_session_path", mode="before")
    def validate_and_transform_path(cls, value: str | Path | None) -> Path | None:
        # It could be `None` if the configuration is loaded in another module (e.g. core, api, etc.)
        if value is None:
            return value

        # Ensure it's a Path object
        value = Path(value)

        # Transform to parent if it's a file
        if value.is_file() or not value.exists():
            value = value.parent

        # Validate it exists and is a directory
        if not value.exists() or not value.is_dir():
            raise ValueError(f"Provided directory {value} should exist")

        return value


indexer_settings = IndexerSettings()
