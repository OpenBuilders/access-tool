import asyncio
from celery.result import AsyncResult
from indexer.celery_app import app


async def wait_for_task(
    *,
    task_id: str | None = None,
    task_result: AsyncResult | None = None,
    interval: float = 1.0,
) -> bool:
    if not task_result and task_id:
        task_result = AsyncResult(task_id, app=app)
    elif not task_result and not task_id:
        raise ValueError("Either task_id or task_result should be provided")

    while not task_result.ready():
        await asyncio.sleep(interval)
    return task_result.successful()
