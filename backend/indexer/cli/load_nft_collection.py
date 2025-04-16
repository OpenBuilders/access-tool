import asyncio

import click

from core.actions.nft_collection import NftCollectionAction
from core.services.db import DBService


@click.command()
@click.argument("address")
def main(address: str) -> None:
    """
    CLI command to add a new NFT collection to the database.
    """

    with DBService().db_session() as db_session:
        nft_collection_action = NftCollectionAction(db_session)
        asyncio.run(nft_collection_action.create(address))
