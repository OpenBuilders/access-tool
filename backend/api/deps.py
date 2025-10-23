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
from core.dtos.pagination import PaginationMetadataDTO, OrderingRuleDTO
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
    """
    Validates the provided API token against the allowed API tokens in the system.

    This function ensures that the input token conforms to the expected pattern
    and is also part of the allowed API tokens.
    If the validation fails, an appropriate HTTP exception with a forbidden status code is raised.

    :param token: The API token to be validated.
        It must be a string that matches the defined pattern and has a minimum length of 64 characters.
    :return: The validated API token if it is valid.
    :raises HTTPException: If the token is not in the allowed API tokens list or does not
        meet the required criteria.
    """
    if token not in api_settings.allowed_api_tokens:
        raise HTTPException(detail="Invalid API token", status_code=HTTP_403_FORBIDDEN)

    return token


def get_pagination_params(
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
    include_total_count: Annotated[bool, Query(alias="includeTotalCount")] = True,
) -> PaginationMetadataDTO:
    """
    Retrieves pagination parameters with specified offset, limit, and an optional
    flag to include the total count in the metadata.

    :param offset: The starting point of the pagination.
        Must be a non-negative integer.
    :param limit: The maximum number of items to return.
        Must be an integer between 1 and 100, inclusive.
    :param include_total_count: A boolean indicating whether to include the total
        count of items in the pagination metadata.
        Should mostly be used for performance reasons.
    :return: Pagination metadata containing the offset, limit, and include_total_count
        flag.
    """
    return PaginationMetadataDTO(
        offset=offset, limit=limit, include_total_count=include_total_count
    )


def get_sorting_params(
    order_by: Annotated[str | None, Query()] = None,
    is_ascending: Annotated[bool, Query()] = True,
) -> OrderingRuleDTO | None:
    """
    Extracts sorting parameters from query string inputs and returns an
    OrderingRuleDTO object if valid parameters are provided.
    This function is designed to handle optional sorting fields and ascending/descending
    order flags, with a default behavior when parameters are not provided.

    NOTE: It only allows ordering by a single field.

    :param order_by: The name of the field to sort by.
        If None, the default sorting will be applied.
    :param is_ascending: A boolean indicating whether the sorting should
        be in ascending order (True) or descending order (False).
        Defaults to True.
    :return: An OrderingRuleDTO object if `order_by` is specified, otherwise None.
    """
    if order_by:
        return OrderingRuleDTO(field=order_by, is_ascending=is_ascending)

    return None
