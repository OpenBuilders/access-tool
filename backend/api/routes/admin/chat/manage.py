from fastapi import Depends, HTTPException, APIRouter
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

from api.deps import get_db_session
from api.pos.base import BaseExceptionFDO
from api.pos.chat import TelegramChatWithRulesFDO, BaseTelegramChatFDO, EditChatCPO
from api.routes.admin.chat.rule import manage_rules_router
from core.actions.chat import TelegramChatManageAction
from core.exceptions.chat import TelegramChatNotSufficientPrivileges


admin_chat_manage_router = APIRouter(prefix="/{slug}")
admin_chat_manage_router.include_router(manage_rules_router)


@admin_chat_manage_router.get(
    "", description="Get specific chat details", tags=["Chat management"]
)
async def get_chat(
    request: Request,
    slug: str,
    db_session: Session = Depends(get_db_session),
) -> TelegramChatWithRulesFDO:
    telegram_chat_action = TelegramChatManageAction(
        db_session=db_session,
        requestor=request.state.user,
        chat_slug=slug,
    )
    result = await telegram_chat_action.get_with_eligibility_rules()
    return TelegramChatWithRulesFDO.from_dto(result)


@admin_chat_manage_router.post(
    "/refresh",
    description="Refreshes chat details, like logo. Normally not needed and is more like an emergency endpoint.",
    tags=["Chat management"],
    responses={
        HTTP_200_OK: {"model": BaseTelegramChatFDO},
        HTTP_400_BAD_REQUEST: {
            "description": "Occurs when bot has no valid permissions to manage the requested chat",
            "model": BaseExceptionFDO,
        },
    },
)
async def refresh_chat(
    request: Request,
    slug: str,
    db_session: Session = Depends(get_db_session),
) -> BaseTelegramChatFDO:
    action = TelegramChatManageAction(
        db_session=db_session,
        requestor=request.state.user,
        chat_slug=slug,
    )
    try:
        result = await action.refresh()
        return BaseTelegramChatFDO.model_validate(result.model_dump())
    except TelegramChatNotSufficientPrivileges:
        raise HTTPException(
            detail="You have to add bot to chat with admin rights to invite users first",
            status_code=HTTP_400_BAD_REQUEST,
        )


@admin_chat_manage_router.put("", tags=["Chat management"])
async def update_chat(
    request: Request,
    slug: str,
    chat: EditChatCPO,
    db_session: Session = Depends(get_db_session),
) -> BaseTelegramChatFDO:
    telegram_chat_action = TelegramChatManageAction(
        db_session=db_session,
        requestor=request.state.user,
        chat_slug=slug,
    )
    result = await telegram_chat_action.update(description=chat.description)
    return BaseTelegramChatFDO.model_validate(result.model_dump())


@admin_chat_manage_router.delete(
    "",
    deprecated=True,
    tags=["Chat management"],
)
async def delete_chat(
    request: Request,
    slug: str,
    db_session: Session = Depends(get_db_session),
) -> None:
    telegram_chat_action = TelegramChatManageAction(
        db_session=db_session,
        requestor=request.state.user,
        chat_slug=slug,
    )
    await telegram_chat_action.delete()
