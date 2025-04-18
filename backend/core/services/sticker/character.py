from core.models import StickerCharacter
from core.services.base import BaseService


class StickerCharacterService(BaseService):
    def get(self, character_id: int) -> StickerCharacter:
        return self.db_session.query(StickerCharacter.id == character_id).one()

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
    ) -> StickerCharacter:
        new_character = StickerCharacter(
            external_id=character_id,
            collection_id=collection_id,
            name=name,
            description=description,
            supply=supply,
        )
        self.db_session.add(new_character)
        self.db_session.commit()
        return new_character
