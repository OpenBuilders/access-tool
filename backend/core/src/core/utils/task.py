import asyncio

from celery import Celery
from celery.result import AsyncResult

from core.constants import DEFAULT_ASYNC_TASK_WAIT_TIMEOUT_SECONDS
from core.settings import core_settings


# This is a specific utility sender app that helps to trigger tasks
# from other applications without a need to import these tasks.
# All it needs is to use the same broker URL for queueing and receiving results
sender = Celery("task-sender")
sender.conf.update(
    {
        "broker_url": core_settings.broker_url,
        "result_backend": core_settings.broker_url,
    }
)


async def wait_for_task(
    *,
    task_id: str | None = None,
    task_result: AsyncResult | None = None,
    interval: float = 1.0,
    timeout: float = DEFAULT_ASYNC_TASK_WAIT_TIMEOUT_SECONDS,
) -> bool:
    if not task_result and task_id:
        task_result = AsyncResult(task_id)
    elif not task_result and not task_id:
        raise ValueError("Either task_id or task_result should be provided")

    elapsed = 0.0
    while not task_result.ready():
        if elapsed >= timeout:
            raise TimeoutError("Task waiting timed out")
        await asyncio.sleep(interval)
        elapsed += interval
    return task_result.successful()
