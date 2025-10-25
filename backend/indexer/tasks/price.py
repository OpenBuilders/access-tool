import logging

from asgiref.sync import async_to_sync

from core.constants import CELERY_INDEX_PRICES_QUEUE_NAME
from core.services.db import DBService
from indexer.actions.price import JettonPriceIndexerAction
from indexer.celery_app import app

logger = logging.getLogger(__name__)


async def refresh_jettons_price():
    with DBService().db_session() as db_session:
        action = JettonPriceIndexerAction(db_session=db_session)
        await action.refresh_jettons_price()
        logger.info("Successfully completed jetton prices refreshing action")


@app.task(
    name="refresh-prices",
    queue=CELERY_INDEX_PRICES_QUEUE_NAME,
    ignore_result=True,
)
def refresh_prices():
    async_to_sync(refresh_jettons_price)()
