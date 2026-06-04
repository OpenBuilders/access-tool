from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

from core.settings import core_settings


# Database setup
DATABASE_URL = core_settings.db_connection_string
engine = create_engine(
    DATABASE_URL,
    pool_size=300,
    pool_recycle=3600,
    pool_pre_ping=True,
)
Base = declarative_base()
