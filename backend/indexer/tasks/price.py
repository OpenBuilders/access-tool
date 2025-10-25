import asyncio
import logging

from asgiref.sync import async_to_sync

from core.constants import CELERY_INDEX_PRICES_QUEUE_NAME
from core.services.db import DBService
from indexer.actions.price import (
    JettonPriceIndexerAction,
    TonPriceIndexerAction,
    NftCollectionPriceIndexerAction,
    StickerdomPriceIndexerAction,
)
from indexer.celery_app import app

logger = logging.getLogger(__name__)


async def refresh_toncoin_price():
    with DBService().db_session() as db_session:
        action = TonPriceIndexerAction(db_session=db_session)
        logger.info("Started TON prices refreshing action")
        await action.refresh_toncoin_price()
        logger.info("Successfully completed TON prices refreshing action")


async def refresh_jettons_price():
    with DBService().db_session() as db_session:
        action = JettonPriceIndexerAction(db_session=db_session)
        logger.info("Started jetton prices refreshing action")
        await action.refresh_jettons_price()
        logger.info("Successfully completed jetton prices refreshing action")


async def refresh_nft_collection_price():
    with DBService().db_session() as db_session:
        action = NftCollectionPriceIndexerAction(db_session)
        logger.info("Started NFT collection prices refreshing action")
        await action.refresh_nft_collections_price()
        logger.info("Successfully completed NFT collection prices refreshing action")


async def refresh_stickers_price():
    with DBService().db_session() as db_session:
        action = StickerdomPriceIndexerAction(db_session)
        logger.info("Started stickers prices refreshing action")
        await action.refresh_stickerdom_price()
        logger.info("Successfully completed stickers prices refreshing action")


async def refresh_all_prices():
    """
    Refreshes all prices for Toncoin, Jettons, NFT collections and other assets asynchronously.

    This function calls specific tasks to refresh the prices of different types of assets.

    """
    # TON price should be refreshed first to ensure NFT collections price is properly calculated in USD,
    # since GetGems only returns it in TON
    await refresh_toncoin_price()
    # Parallel these actions since they are using different services to speed them up
    await asyncio.gather(
        refresh_jettons_price(),
        refresh_nft_collection_price(),
        refresh_stickers_price(),
    )


@app.task(
    name="refresh-prices",
    queue=CELERY_INDEX_PRICES_QUEUE_NAME,
    ignore_result=True,
)
def refresh_prices():
    async_to_sync(refresh_all_prices)()
