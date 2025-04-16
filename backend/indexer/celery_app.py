import logging

from celery import Celery
from indexer.settings import wallet_indexer_settings


logger = logging.getLogger(__name__)


def create_app() -> Celery:
    _app = Celery()
    _app.conf.update(
        {
            "broker_url": wallet_indexer_settings.broker_url,
            "result_backend": wallet_indexer_settings.broker_url,
            "include": ["indexer.tasks"],
            "worker_concurrency": wallet_indexer_settings.worker_concurrency,
        }
    )
    return _app


app = create_app()
