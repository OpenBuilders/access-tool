from pathlib import Path

from core.settings import CoreSettings


class IndexerSettings(CoreSettings):
    worker_concurrency: int = 5

    sticker_dom_private_key_path: str | Path
    sticker_dom_base_url: str
    sticker_dom_data_storage_base_url: str
    sticker_dom_consumer_id: int
    sticker_dom_ownership_header_key: str | None = None
    sticker_dom_ownership_header_value: str | None = None
    sticker_dom_batch_processing_size: int = 5_000


indexer_settings = IndexerSettings()
