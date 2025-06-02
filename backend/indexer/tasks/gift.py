import asyncio
import logging

from core.constants import UPDATED_GIFT_USER_IDS
from core.services.db import DBService
from indexer.actions.gift.item import IndexerGiftUniqueAction
from indexer.celery_app import app


logger = logging.getLogger(__name__)


async def index_gift_ownerships():
    with DBService().db_session() as db_session:
        action = IndexerGiftUniqueAction(db_session)
        async for batch in action.index_all():
            if not batch:
                logger.info("No gift ownerships changes found.")
                continue

            action.redis_service.add_to_set(UPDATED_GIFT_USER_IDS, *batch)
            logger.info(f"Updated user IDs count: {len(batch)}")

        logger.info("Gift ownerships indexed.")


@app.task(name="fetch-gift-ownership-details")
def fetch_gift_ownership_details():
    asyncio.run(index_gift_ownerships())
