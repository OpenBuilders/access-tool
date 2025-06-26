from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND

from api.deps import get_db_session
from api.pos.base import BaseExceptionFDO
from api.pos.chat import TelegramChatRuleGroupFDO
from core.actions.chat.group import TelegramChatRuleGroupAction

manage_rule_group_router = APIRouter(prefix="/groups", tags=["Chat Rules Group"])


@manage_rule_group_router.post(
    "/",
    deprecated=True,
    description="Don't use direct group creation endpoint, use create task with an empty group instead.",
)
async def create_group(
    request: Request,
    slug: str,
    db_session: Session = Depends(get_db_session),
) -> TelegramChatRuleGroupFDO:
    action = TelegramChatRuleGroupAction(
        db_session=db_session, requestor=request.state.user, chat_slug=slug
    )
    result = action.create()
    return TelegramChatRuleGroupFDO.model_validate(result.model_dump())


@manage_rule_group_router.delete(
    "/{group_id}",
    deprecated=True,
    description="Delete a rule group for the chat. Don't delete group manually, use delete/move task endpoint instead.",
    responses={
        HTTP_200_OK: {"model": None, "description": "Rule Group Deleted Successfully"},
        HTTP_400_BAD_REQUEST: {
            "model": BaseExceptionFDO,
            "description": "An attempt to remove the only group",
        },
        HTTP_404_NOT_FOUND: {
            "model": BaseExceptionFDO,
            "description": "Rule Group Not Found",
        },
    },
)
async def delete_group(
    request: Request,
    slug: str,
    group_id: int,
    db_session: Session = Depends(get_db_session),
) -> None:
    action = TelegramChatRuleGroupAction(
        db_session=db_session, requestor=request.state.user, chat_slug=slug
    )
    return action.delete(group_id=group_id)
