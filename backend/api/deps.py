import hashlib
import hmac
import json
import logging
from typing import Annotated
from urllib.parse import unquote_plus

from fastapi import HTTPException, Depends, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.status import (
    HTTP_401_UNAUTHORIZED,
    HTTP_403_FORBIDDEN,
    HTTP_404_NOT_FOUND,
)

from api.pos.auth import InitDataPO
from api.pos.chat import validate_address
from core.dtos.user import UserInitDataPO
from api.services.authentication import AuthenticationService, UnauthorizedError
from api.settings import api_settings
from core.models.user import User
from core.services.db import DBService
from core.services.user import UserService

security = HTTPBearer(auto_error=False)
logger = logging.getLogger(__name__)


def get_db_session():
    with DBService().db_session() as db_session:
        yield db_session


def validate_user_init_data(init_data_po: InitDataPO) -> UserInitDataPO:
    c_str = "WebAppData"

    init_data = init_data_po.init_data

    init_data = dict(
        sorted(
            [chunk.split("=") for chunk in init_data.split("&")],
            key=lambda x: x[0],
        )
    )

    _hash = init_data.pop("hash")

    # URL-decode the values
    init_data = {key: unquote_plus(value) for key, value in init_data.items()}

    # Generate the data_check_string
    data_check_string = "\n".join(
        [f"{key}={value}" for key, value in init_data.items()]
    )

    secret_key = hmac.new(
        c_str.encode(), api_settings.telegram_bot_token.encode(), hashlib.sha256
    ).digest()
    data_check = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256)

    if data_check.hexdigest() != _hash:
        raise HTTPException(status_code=400, detail="Invalid user data: wrong hash")

    user_data = json.loads(init_data.get("user", "{}"))

    user_data_init_po = UserInitDataPO(**user_data)

    return user_data_init_po


def validate_access_token(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db_session: Session = Depends(get_db_session),
) -> User:
    if not credentials:
        raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Unauthorized")
    access_token = credentials.credentials
    try:
        user_id = AuthenticationService.verify_token(access_token)
        user_service = UserService(db_session)
        user = user_service.get(user_id)
        request.state.user = user
        return request.state.user
    except UnauthorizedError:
        raise HTTPException(
            status_code=HTTP_401_UNAUTHORIZED, detail="Invalid access token"
        )


def validate_admin_access(
    user: User = Depends(validate_access_token),
) -> None:
    if not user.is_admin:
        raise HTTPException(
            status_code=HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this resource",
        )


def get_address_raw(address: str) -> str:
    try:
        address_raw = validate_address(is_required=True)(address)
    except ValueError as e:
        raise HTTPException(detail=str(e), status_code=HTTP_404_NOT_FOUND) from e

    return address_raw


def validate_api_token(
    token: Annotated[str, Query(pattern=r"^[a-zA-Z0-9\-\_]+$", min_length=64)],
) -> str:
    if token not in api_settings.allowed_api_tokens:
        raise HTTPException(detail="Invalid API token", status_code=HTTP_403_FORBIDDEN)

    return token
