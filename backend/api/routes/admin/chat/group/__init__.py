from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from starlette.requests import Request

from api.deps import get_db_session
from api.pos.chat import TelegramChatRuleGroupFDO
from core.actions.chat.group import TelegramChatRuleGroupAction

manage_rule_group_router = APIRouter(prefix="/groups", tags=["Chat Rules Group"])


@manage_rule_group_router.post("/")
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


@manage_rule_group_router.delete("/{group_id}")
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
