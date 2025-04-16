from sqlalchemy.orm import Session

from core.services.user import UserService


class BaseAction:
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session
        self.user_service = UserService(db_session)
