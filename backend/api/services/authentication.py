import logging
from datetime import timedelta, datetime

import jwt

from api.settings import api_settings

logger = logging.getLogger(__name__)


class UnauthorizedError(Exception):
    pass


class AuthenticationService:
    @classmethod
    def create_access_token(cls, user_id: int, expires_in: int):
        to_encode = {"sub": str(user_id)}
        expire = datetime.now() + timedelta(seconds=expires_in)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, api_settings.jwt_secret_key, algorithm=api_settings.jwt_algorithm
        )
        return encoded_jwt

    @classmethod
    def verify_token(cls, token: str) -> int:
        try:
            payload = jwt.decode(
                token,
                api_settings.jwt_secret_key,
                algorithms=[api_settings.jwt_algorithm],
            )
        except jwt.exceptions.PyJWTError as e:
            logger.warning(f"Can't validate token: {e}")
            raise UnauthorizedError("Could not validate credentials")

        user_id: str | None = payload.get("sub")
        if user_id is None:
            logger.warning("Can't find 'sub' in token payload")
            raise UnauthorizedError("Could not validate credentials")
        return int(user_id)
