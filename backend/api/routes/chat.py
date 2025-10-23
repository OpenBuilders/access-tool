import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from starlette.status import HTTP_404_NOT_FOUND, HTTP_200_OK

from api.deps import (
    validate_access_token,
    get_db_session,
    get_pagination_params,
    get_sorting_params,
)
from api.pos.base import BaseExceptionFDO
from api.pos.chat import (
    TelegramChatWithEligibilitySummaryFDO,
    PaginatedTelegramChatsFDO,
    TelegramChatPreviewFDO,
)
from core.dtos.pagination import PaginationMetadataDTO, OrderingRuleDTO
from core.exceptions.chat import TelegramChatNotExists
from core.actions.chat import TelegramChatAction
from core.models.user import User

logger = logging.getLogger(__name__)

chat_router = APIRouter(prefix="/chats", tags=["Chats"])


@chat_router.get(
    "/{slug}",
    responses={
        HTTP_200_OK: {"model": TelegramChatWithEligibilitySummaryFDO},
        HTTP_404_NOT_FOUND: {
            "description": "Chat not found",
            "model": BaseExceptionFDO,
        },
    },
)
async def get_chat(
    slug: str,
    user: User = Depends(validate_access_token),
    db_session: Session = Depends(get_db_session),
) -> TelegramChatWithEligibilitySummaryFDO:
    telegram_chat_action = TelegramChatAction(db_session)
    try:
        result = await telegram_chat_action.get_with_eligibility_summary(
            slug=slug,
            user=user,
        )
        return TelegramChatWithEligibilitySummaryFDO.from_dto(result)
    except TelegramChatNotExists:
        raise HTTPException(
            detail="Chat not found",
            status_code=HTTP_404_NOT_FOUND,
        )


@chat_router.get(
    "/",
    responses={
        HTTP_200_OK: {"model": PaginatedTelegramChatsFDO},
    },
)
async def get_chats(
    _: User = Depends(validate_access_token),
    db_session: Session = Depends(get_db_session),
    pagination_params: PaginationMetadataDTO = Depends(get_pagination_params),
    sorting_params: OrderingRuleDTO | None = Depends(get_sorting_params),
) -> PaginatedTelegramChatsFDO:
    telegram_chat_action = TelegramChatAction(db_session)
    chats = telegram_chat_action.get_all(
        pagination_params=pagination_params,
        sorting_params=sorting_params,
    )
    return PaginatedTelegramChatsFDO(
        items=[
            TelegramChatPreviewFDO.model_validate(chat.model_dump())
            for chat in chats.items
        ],
        total_count=chats.total_count,
    )
