import logging

from community_manager.gateway.types import GatewayCommand
from core.services.superredis import RedisService
from core.constants import CELERY_GATEWAY_INDEX_QUEUE_NAME

logger = logging.getLogger(__name__)


class TelegramGatewayClient:
    def __init__(self) -> None:
        self.redis_service = RedisService()
        self.queue_name = CELERY_GATEWAY_INDEX_QUEUE_NAME

    def enqueue_command(self, command: GatewayCommand) -> None:
        """
        Enqueues a command to the gateway service via Redis.
        """
        try:
            payload = command.model_dump_json()
            self.redis_service.rpush(self.queue_name, payload)
            logger.info(
                f"Enqueued command: {command.command_type} for chat {getattr(command, 'chat_id', 'unknown')}"
            )
        except Exception as e:
            logger.error(f"Failed to enqueue command: {e}", exc_info=True)
            raise e
