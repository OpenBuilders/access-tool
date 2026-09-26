import random

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from starlette.status import (
    HTTP_200_OK,
    HTTP_408_REQUEST_TIMEOUT,
    HTTP_502_BAD_GATEWAY,
)

from api.deps import get_db_session
from api.pos.base import BaseExceptionFDO
from api.pos.chat import WhitelistRuleUsersFDO
from api.pos.common import StatusFDO
from core.actions.system import SystemAction
from core.utils.task import wait_for_task

system_router = APIRouter(prefix="/system", tags=["System"])
system_non_authenticated_router = APIRouter(prefix="/system", tags=["System"])


@system_router.get(
    "/async-tasks/{task_id}",
    responses={
        HTTP_200_OK: {"model": StatusFDO},
        HTTP_408_REQUEST_TIMEOUT: {
            "description": "Occurs when the task took longer than expected to complete",
            "model": BaseExceptionFDO,
        },
        HTTP_502_BAD_GATEWAY: {
            "description": "Occurs when the system failed to complete the task",
            "model": BaseExceptionFDO,
        },
    },
)
async def get_task_status(
    task_id: str,
) -> StatusFDO:
    try:
        is_successful = await wait_for_task(task_id=task_id)
    except TimeoutError:
        raise HTTPException(
            detail="Task took longer than expected",
            status_code=HTTP_408_REQUEST_TIMEOUT,
        )

    if is_successful:
        return StatusFDO(status="success", message="Task is completed successfully")
    else:
        raise HTTPException(
            detail="Failed to complete the task",
            status_code=HTTP_502_BAD_GATEWAY,
        )


@system_non_authenticated_router.get(
    "/test-get-random-users-list",
    description="Test dynamic whitelist endpoint. Should not be used in the production",
    tags=["Test"],
)
async def get_random_users_list() -> WhitelistRuleUsersFDO:
    return WhitelistRuleUsersFDO(
        users=[random.randint(1234567, 23456789) for _ in range(10)]
    )


@system_non_authenticated_router.get("/health", description="Health check")
async def get_health(
    db_session: Session = Depends(get_db_session),
) -> StatusFDO:
    action = SystemAction(db_session=db_session)
    return action.healthcheck()
