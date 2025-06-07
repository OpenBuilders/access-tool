from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from starlette.status import HTTP_200_OK, HTTP_404_NOT_FOUND

from api.deps import get_db_session, get_address_raw
from api.pos.base import BaseExceptionFDO
from api.pos.chat import WhitelistRuleUsersFDO
from api.pos.jetton import JettonThresholdFiltersPO
from core.actions.jetton_wallet import JettonWalletAction

jetton_router = APIRouter(prefix="/jetton", tags=["Jetton"])


@jetton_router.get(
    "/{address}",
    description="Returns a list of users holding the provided jetton address",
    responses={
        HTTP_200_OK: {"model": WhitelistRuleUsersFDO},
        HTTP_404_NOT_FOUND: {
            "model": BaseExceptionFDO,
            "description": "Address is not being indexed",
        },
    },
)
async def get_jetton_holders(
    address_raw: Annotated[str, Depends(get_address_raw)],
    filters: JettonThresholdFiltersPO = Query(description="Threshold filter value."),
    db_session: Session = Depends(get_db_session),
) -> WhitelistRuleUsersFDO:
    action = JettonWalletAction(db_session=db_session)
    telegram_ids = action.get_holders_telegram_ids(
        address_raw=address_raw, filters=filters
    )
    return WhitelistRuleUsersFDO(users=list(telegram_ids))
