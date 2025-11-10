from core.settings import CoreSettings


class BlockchainIndexerSettings(CoreSettings):
    worker_concurrency: int = 5


blockchain_indexer_settings = BlockchainIndexerSettings()
