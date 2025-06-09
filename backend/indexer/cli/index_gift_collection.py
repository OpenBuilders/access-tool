import asyncio
import logging

import click

from indexer.actions.gift.collection import IndexerGiftCollectionAction
from core.services.db import DBService
from indexer.settings import indexer_settings
from indexer.utils.session import SessionLockManager

logger = logging.getLogger(__name__)


async def index_gift_collection(slug: str) -> None:
    with DBService().db_session() as db_session:
        with SessionLockManager(
            indexer_settings.telegram_indexer_session_path
        ) as session_path:
            action = IndexerGiftCollectionAction(db_session, session_path=session_path)
            await action.index(slug)


@click.command()
@click.argument("slug")
def main(slug: str) -> None:
    """
    CLI command to load a Telegram chat.
    """
    asyncio.run(index_gift_collection(slug))
