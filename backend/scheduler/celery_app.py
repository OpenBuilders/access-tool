from celery import Celery
from celery.schedules import crontab

from core.constants import (
    CELERY_NOTICED_WALLETS_UPLOAD_QUEUE_NAME,
    CELERY_SYSTEM_QUEUE_NAME,
    CELERY_STICKER_FETCH_QUEUE_NAME,
    CELERY_GIFT_FETCH_QUEUE_NAME,
)
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
                    "options": {"queue": CELERY_SYSTEM_QUEUE_NAME},
                },
                "refresh-chat-external-sources": {
                    "task": "refresh-chat-external-sources",
                    "schedule": crontab(minute="*/3"),  # Every 3 minutes
                    "options": {"queue": CELERY_SYSTEM_QUEUE_NAME},
                },
                "load-noticed-wallets": {
                    "task": "load-noticed-wallets",
                    "schedule": 15,  # Every 15 seconds
                    "options": {"queue": CELERY_NOTICED_WALLETS_UPLOAD_QUEUE_NAME},
                },
                "refresh-chats": {
                    "task": "refresh-chats",
                    "schedule": crontab(hour="0"),  # Every day at midnight
                    "options": {"queue": CELERY_SYSTEM_QUEUE_NAME},
                },
                "fetch-sticker-collections": {
                    "task": "fetch-sticker-collections",
                    "schedule": crontab(minute="*/10"),  # Every 10 minutes
                    "options": {"queue": CELERY_STICKER_FETCH_QUEUE_NAME},
                },
                "fetch-gift-ownerships": {
                    "task": "fetch-gift-ownership-details",
                    "schedule": crontab(hour="*/1", minute="0"),  # Every hour
                    "options": {"queue": CELERY_GIFT_FETCH_QUEUE_NAME},
                },
            },
            "beat_schedule_filename": core_settings.beat_schedule_filename,
        }
    )
    return _app


app = create_app()
