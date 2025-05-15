from core.settings import CoreSettings

from pydantic import FilePath


class CommunityManagerSettings(CoreSettings):
    ton_api_key: str

    telegram_session_path: FilePath

    worker_concurrency: int = 1
    enable_manager: bool
    items_per_task: int = 100


community_manager_settings = CommunityManagerSettings()
