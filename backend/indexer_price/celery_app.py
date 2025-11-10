import logging

from celery import Celery
from indexer_price.settings import price_indexer_settings


logger = logging.getLogger(__name__)


def create_app() -> Celery:
    _app = Celery()
    _app.conf.update(
        {
            "broker_url": price_indexer_settings.broker_url,
            "result_backend": price_indexer_settings.broker_url,
            "result_expires": 300,  # 5 minutes
            "include": ["indexer_price.tasks"],
            "worker_concurrency": price_indexer_settings.worker_concurrency,
        }
    )
    return _app


app = create_app()
