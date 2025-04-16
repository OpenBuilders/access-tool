import asyncio

import click

from core.actions.jetton import JettonAction
from core.services.db import DBService


@click.command()
@click.argument("address")
def main(address: str) -> None:
    """
    CLI command to add a token to the database.
    """
    with DBService().db_session() as db_session:
        jetton_action = JettonAction(db_session)
        asyncio.run(jetton_action.create(address))
