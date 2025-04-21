from collections.abc import Callable

from factory.alchemy import SQLAlchemyModelFactory
from sqlalchemy.orm import Session


BuilderType = Callable[[Session], SQLAlchemyModelFactory]
