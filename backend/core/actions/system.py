from sqlalchemy import text

from api.pos.common import StatusFDO
from core.actions.base import BaseAction


class SystemAction(BaseAction):
    def healthcheck(self) -> StatusFDO:
        self.db_session.execute(text("SELECT 1"))
        return StatusFDO(
            status="ok",
            message="Healthcheck OK",
        )
