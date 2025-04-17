import logging

from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from starlette.status import HTTP_409_CONFLICT, HTTP_400_BAD_REQUEST

from api.deps import get_db_session
from api.pos.chat import (
    AddChatCPO,
    TelegramChatFDO,
)
from api.routes.admin.chat.manage import admin_chat_manage_router
from core.exceptions.chat import (
    TelegramChatNotSufficientPrivileges,
    TelegramChatAlreadyExists,
    TelegramChatNotExists,
)
from core.actions.chat import TelegramChatAction

admin_chat_router = APIRouter(prefix="/chats")
admin_chat_router.include_router(admin_chat_manage_router)
logger = logging.getLogger(__name__)


@admin_chat_router.get(
    "",
    description="Get all chats managed by the current user - all chats where user is admin",
    tags=["Chat management"],
)
async def get_chats(
    request: Request,
    db_session: Session = Depends(get_db_session),
) -> list[TelegramChatFDO]:
    action = TelegramChatAction(db_session)
    chats = action.get_all(requestor=request.state.user)
    return [TelegramChatFDO.model_validate(chat.model_dump()) for chat in chats]


@admin_chat_router.post("", deprecated=True, tags=["Chat management"])
async def create_chat(
    chat: AddChatCPO,
    db_session: Session = Depends(get_db_session),
) -> TelegramChatFDO:
    telegram_chat_action = TelegramChatAction(db_session)
    try:
        result = await telegram_chat_action.create(chat_identifier=chat.chat_identifier)
        return TelegramChatFDO.model_validate(result.model_dump())
    except TelegramChatAlreadyExists:
        raise HTTPException(
            detail="Chat already exists",
            status_code=HTTP_409_CONFLICT,
        )
    except TelegramChatNotSufficientPrivileges:
        raise HTTPException(
            detail="You have to add bot to chat with admin rights to invite users first",
            status_code=HTTP_400_BAD_REQUEST,
        )
    except TelegramChatNotExists:
        raise HTTPException(
            detail=f"Chat '{chat.chat_identifier}' not found",
            status_code=HTTP_400_BAD_REQUEST,
        )
