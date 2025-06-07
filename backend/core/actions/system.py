from sqlalchemy import text

from api.pos.common import StatusFDO
from core.actions.base import BaseAction
from core.services.superredis import RedisService


class SystemAction(BaseAction):
    def healthcheck(self) -> StatusFDO:
        self.db_session.execute(text("SELECT 1"))
        redis_service = RedisService()
        redis_service.client.ping()
        return StatusFDO(
            status="ok",
            message="Healthcheck OK",
        )
