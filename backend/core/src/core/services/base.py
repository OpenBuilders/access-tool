from sqlalchemy.orm import Session


class BaseService:
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session
