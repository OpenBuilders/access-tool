from urllib.parse import urljoin

import httpx
from celery.utils.log import get_task_logger

from community_manager.celery_app import app
from community_manager.settings import community_manager_settings
from core.constants import CELERY_SYSTEM_QUEUE_NAME


logger = get_task_logger(__name__)


@app.task(name="refresh-metrics", queue=CELERY_SYSTEM_QUEUE_NAME, ignore_result=True)
def refresh_metrics() -> None:
    with httpx.Client() as client:
        for route in (
            "stats/users",
            "stats/chats",
            "stats/members",
            "stats/nft-collections",
            "stats/jettons",
            "stats/wallets",
        ):
            logger.info(f"Checking {route}")
            target_url = urljoin(community_manager_settings.base_api_url, route)
            client.get(target_url)
            logger.info(f"Checked {route}")
