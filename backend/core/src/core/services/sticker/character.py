import logging

from sqlalchemy import or_, and_

from core.models.sticker import StickerCharacter
from core.services.base import BaseService


logger = logging.getLogger(__name__)


class StickerCharacterService(BaseService):
    def get(self, character_id: int) -> StickerCharacter:
        return (
            self.db_session.query(StickerCharacter)
            .filter(StickerCharacter.id == character_id)
            .one()
        )

    def get_all(self, collection_id: int | None = None) -> list[StickerCharacter]:
        query = self.db_session.query(StickerCharacter)
        if collection_id is not None:
            query = query.filter(StickerCharacter.collection_id == collection_id)

        return query.all()

    def create(
        self,
        character_id: int,
        collection_id: int,
        name: str,
        description: str,
        supply: int,
        logo_url: str | None,
    ) -> StickerCharacter:
        new_character = StickerCharacter(
            external_id=character_id,
            collection_id=collection_id,
            name=name,
            description=description,
            supply=supply,
            logo_url=logo_url,
        )
        self.db_session.add(new_character)
        self.db_session.flush()
        return new_character

    @staticmethod
    def is_update_required(
        character: StickerCharacter,
        name: str,
        description: str,
        supply: int,
        logo_url: str | None,
    ) -> bool:
        return any(
            [
                character.name != name,
                character.description != description,
                character.supply != supply,
                character.logo_url != logo_url,
            ]
        )

    def update(
        self,
        character: StickerCharacter,
        name: str,
        description: str,
        supply: int,
        logo_url: str | None,
    ) -> StickerCharacter:
        character.name = name
        character.description = description
        character.supply = supply
        character.logo_url = logo_url
        self.db_session.flush()
        return character

    def map_external_ids_to_internal_ids(
        self, external_ids: list[tuple[int, int]]
    ) -> dict[tuple[int, int], int]:
        """
        Maps a list of external ID tuples to their corresponding internal IDs by querying the database.
        This function retrieves the internal IDs for the provided external IDs and their respective collection IDs.
        If some external IDs are not found in the database, a warning will be logged.

        :param external_ids: A list of tuples where each tuple contains a
            collection ID (int) and external ID (int).
        :return: A dictionary mapping tuples of collection ID and external ID to
            their corresponding internal ID.
        """
        internal_ids_mapping_raw = (
            self.db_session.query(
                StickerCharacter.id,
                StickerCharacter.external_id,
                StickerCharacter.collection_id,
            )
            .filter(
                or_(
                    *(
                        and_(
                            StickerCharacter.collection_id == collection_id,
                            StickerCharacter.external_id == external_id,
                        )
                        for collection_id, external_id in external_ids
                    )
                )
            )
            .all()
        )
        if len(internal_ids_mapping_raw) != len(external_ids):
            logger.warning(
                f"Not all sticker characters were found in the database: {len(external_ids) - len(internal_ids_mapping_raw)} missing"
            )
        internal_ids_mapping = {
            (
                internal_ids_mapping_raw_item.collection_id,
                internal_ids_mapping_raw_item.external_id,
            ): internal_ids_mapping_raw_item.id
            for internal_ids_mapping_raw_item in internal_ids_mapping_raw
        }
        return internal_ids_mapping

    def batch_update_prices(self, prices: dict[tuple[int, int], float]) -> None:
        internal_ids_mapping = self.map_external_ids_to_internal_ids(
            list(prices.keys())
        )
        self.db_session.bulk_update_mappings(
            StickerCharacter,
            [
                {"id": internal_ids_mapping[key], "price": price}
                for key, price in prices.items()
                # Ignore sticker characters which are not (yet) indexed
                if key in internal_ids_mapping
            ],
        )
        self.db_session.flush()
        logger.info(f"Updated {len(prices)} sticker characters prices successfully")
