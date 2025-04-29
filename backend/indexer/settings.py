from pathlib import Path

from core.settings import CoreSettings


class IndexerSettings(CoreSettings):
    worker_concurrency: int = 5

    sticker_dom_private_key_path: str | Path
    sticker_dom_base_url: str
    sticker_dom_data_storage_base_url: str
    sticker_dom_consumer_id: int


indexer_settings = IndexerSettings()
