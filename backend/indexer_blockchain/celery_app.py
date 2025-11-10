import logging

from celery import Celery
from indexer_blockchain.settings import blockchain_indexer_settings


logger = logging.getLogger(__name__)


def create_app() -> Celery:
    _app = Celery()
    _app.conf.update(
        {
            "broker_url": blockchain_indexer_settings.broker_url,
            "result_backend": blockchain_indexer_settings.broker_url,
            "result_expires": 300,  # 5 minutes
            "include": ["indexer_blockchain.tasks"],
            "worker_concurrency": blockchain_indexer_settings.worker_concurrency,
        }
    )
    return _app


app = create_app()
