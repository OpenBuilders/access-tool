import asyncio
import logging

import click

from core.constants import DEFAULT_WALLET_TRACK_EXPIRATION
from core.services.db import DBService
from core.services.superredis import RedisService
from core.services.wallet import WalletService
from indexer.tasks import fetch_wallet_details

logger = logging.getLogger(__name__)


async def load_wallets_on_start() -> None:
    with DBService().db_session() as db_session:
        wallet_service = WalletService(db_session)
        all_wallets = list(wallet_service.get_all_wallet_addresses())

        logger.info("Queuing tasks for fetching wallet details")
        for wallet in all_wallets:
            fetch_wallet_details.apply_async(args=(wallet,))
        logger.info("%d tasks queued", len(all_wallets))

        logger.info("Setting wallet tracking in Redis")
        redis_service = RedisService(external=True)
        redis_service.set_all(
            {wallet: "" for wallet in all_wallets}, ex=DEFAULT_WALLET_TRACK_EXPIRATION
        )
        logger.info("Wallet tracking set in Redis")


@click.command()
def main() -> None:
    """
    CLI command to load a Telegram chat.
    """
    asyncio.run(load_wallets_on_start())
