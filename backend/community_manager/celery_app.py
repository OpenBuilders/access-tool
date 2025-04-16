from celery import Celery

from community_manager.settings import community_manager_settings


def create_app() -> Celery:
    _app = Celery()
    _app.conf.update(
        {
            "broker_url": community_manager_settings.broker_url,
            "result_backend": community_manager_settings.broker_url,
            "include": ["community_manager.tasks"],
            "worker_concurrency": community_manager_settings.worker_concurrency,
        }
    )
    return _app


app = create_app()
