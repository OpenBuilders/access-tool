import datetime

from sqlalchemy.dialects.postgresql import JSONB, TIMESTAMP
from sqlalchemy.orm import mapped_column

from core.db import Base


class Stats(Base):
    __tablename__ = "stats"

    data = mapped_column(JSONB, nullable=False)
    timestamp = mapped_column(
        TIMESTAMP(timezone=False),
        nullable=False,
        default=lambda: datetime.datetime.now(tz=datetime.timezone.utc),
        primary_key=True,
    )
