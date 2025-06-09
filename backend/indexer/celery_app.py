import logging

from celery import Celery
from indexer.settings import indexer_settings


logger = logging.getLogger(__name__)


def create_app() -> Celery:
    _app = Celery()
    _app.conf.update(
        {
            "broker_url": indexer_settings.broker_url,
            "result_backend": indexer_settings.broker_url,
            "result_expires": 300,  # 5 minutes
            "include": ["indexer.tasks"],
            "worker_concurrency": indexer_settings.worker_concurrency,
        }
    )
    return _app


app = create_app()
