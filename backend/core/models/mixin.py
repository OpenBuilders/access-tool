from sqlalchemy import Numeric
from sqlalchemy.orm import mapped_column

from core.db import Base


class PricedEntityMixin(Base):
    __abstract__ = True

    price = mapped_column(
        Numeric(precision=15, scale=6),
        nullable=True,
        doc="Price per unit (usually in USD)",
    )
