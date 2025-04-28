import json
import logging
from pathlib import Path

import click

from core.actions.sticker import StickerCollectionAction, StickerCharacterAction
from core.dtos.sticker import StickerCollectionDTO, StickerCharacterDTO
from core.services.db import DBService


CURRENT_PATH = Path(__file__).parent
STICKERS_DATA_PATH = CURRENT_PATH.parent / "data" / "stickers"


logger = logging.getLogger(__name__)


@click.command()
def main() -> None:
    """
    Main command for populating stickers data into the database.

    Reads sticker collection and character data from JSON files and utilizes database
    actions to store them into the database. The data includes details about sticker
    collections and their associated characters.

    The command processes the following steps:
    1. Reads the sticker collections data from a predefined JSON file.
    2. Extracts and processes each collection's details.
    3. Optionally reads and processes the associated sticker characters for each
       collection from respective JSON files.

    This command logs the creation of each sticker collection and character to
    give a clear progress report.

    :raises FileNotFoundError: If any expected JSON data file is missing.
    :raises json.JSONDecodeError: If any JSON data file is not formatted correctly.
    """
    with open(STICKERS_DATA_PATH / "collections.json", "r") as f:
        collections_raw = f.read()
        collections = json.loads(collections_raw)

    with DBService().db_session() as db_session:
        sticker_collection_action = StickerCollectionAction(db_session)
        sticker_character_action = StickerCharacterAction(db_session)
        for collection in collections["data"]:
            logo_url_object = next(
                filter(lambda media: media["type"] == "logo", collection["media"]), None
            )
            logo_url = logo_url_object["url"] if logo_url_object else None
            logger.info(f"Creating sticker collection {collection['title']!r}...")
            sticker_collection_action.get_or_create(
                StickerCollectionDTO(
                    id=collection["id"],
                    title=collection["title"],
                    description=collection["description"],
                    logo_url=logo_url,
                )
            )

            collection_data = STICKERS_DATA_PATH / f"{collection['id']}.json"

            if collection_data.exists():
                with open(collection_data, "r") as f:
                    collection_data_raw = f.read()
                    collection_data = json.loads(collection_data_raw)

                for character in collection_data["data"]["characters"]:
                    logger.info(
                        f"Creating sticker character {character['name']!r} for collection {collection['title']!r}..."
                    )
                    sticker_character_action.get_or_create(
                        StickerCharacterDTO(
                            id=character["id"],
                            collection_id=character["collection_id"],
                            name=character["name"],
                            description=character["description"],
                            supply=character["supply"],
                        )
                    )

    click.echo("All collections and characters were loaded successfully.")
