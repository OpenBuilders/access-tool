from celery import Celery
from celery.schedules import crontab

from core.settings import core_settings


def create_app() -> Celery:
    _app = Celery()
    _app.conf.update(
        {
            "broker_url": core_settings.broker_url,
            "result_backend": core_settings.broker_url,
            "include": [
                "community_manager.tasks",
                "indexer.tasks",
            ],
            "beat_schedule": {
                "check-chat-members": {
                    "task": "check-chat-members",
                    "schedule": crontab(minute="*/1"),  # Every minute
                },
                "refresh-chat-external-sources": {
                    "task": "refresh-chat-external-sources",
                    "schedule": crontab(minute="*/3"),  # Every 3 minutes
                },
                "load-noticed-wallets": {
                    "task": "load-noticed-wallets",
                    "schedule": 15,  # Every 15 seconds
                },
                "refresh-chats": {
                    "task": "refresh-chats",
                    "schedule": crontab(hour="0"),  # Every day at midnight
                },
            },
            "beat_schedule_filename": core_settings.beat_schedule_filename,
        }
    )
    return _app


app = create_app()
