import logging

from sqlalchemy import desc

from core.dtos.stats import StatsDTO
from core.models.stats import Stats
from core.services.base import BaseService


logger = logging.getLogger(__name__)


class StatsService(BaseService):
    def create(self, dto: StatsDTO) -> Stats:
        stats = Stats(data=dto.model_dump())
        self.db_session.add(stats)
        self.db_session.commit()
        logger.info("New stats stored in the database.")
        return stats

    def get_latest(self) -> Stats:
        stats = self.db_session.query(Stats).order_by(desc(Stats.timestamp)).one()
        return stats
