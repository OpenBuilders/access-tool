import logging

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from api.deps import get_db_session
from api.pos.chat import (
    TelegramChatFDO,
)
from api.routes.admin.chat.manage import admin_chat_manage_router
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
    chats = action.get_all_managed(requestor=request.state.user)
    return [TelegramChatFDO.model_validate(chat.model_dump()) for chat in chats]
