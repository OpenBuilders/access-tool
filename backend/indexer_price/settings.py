from core.settings import CoreSettings


class PriceIndexerSettings(CoreSettings):
    worker_concurrency: int = 5

    getgems_api_key: str | None = None


price_indexer_settings = PriceIndexerSettings()
