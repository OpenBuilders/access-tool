from core.settings import CoreSettings


class WalletIndexerSettings(CoreSettings):
    ton_api_key: str

    worker_concurrency: int = 5


wallet_indexer_settings = WalletIndexerSettings()
