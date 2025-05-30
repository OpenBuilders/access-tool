import asyncio
import logging

import click

from indexer.actions.gift.collection import IndexerGiftCollectionAction
from core.services.db import DBService

logger = logging.getLogger(__name__)


async def index_gift_collection(slug: str) -> None:
    with DBService().db_session() as db_session:
        action = IndexerGiftCollectionAction(db_session)
        await action.index(slug)


@click.command()
@click.argument("slug")
def main(slug: str) -> None:
    """
    CLI command to load a Telegram chat.
    """
    asyncio.run(index_gift_collection(slug))
