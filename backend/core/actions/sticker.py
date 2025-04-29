import itertools
import logging

from sqlalchemy.exc import NoResultFound

from core.actions.base import BaseAction
from core.dtos.sticker import (
    StickerCollectionDTO,
    StickerItemDTO,
    MinimalStickerCollectionWithCharactersDTO,
    StickerCharacterDTO,
    MinimalStickerCharacterDTO,
)
from core.exceptions.sticker import (
    StickerCollectionNotFound,
    StickerNotFound,
    StickerCharacterNotFound,
)
from core.services.sticker.character import StickerCharacterService
from core.services.sticker.collection import StickerCollectionService
from core.services.sticker.item import StickerItemService
from core.services.superredis import RedisService
from core.services.user import UserService


logger = logging.getLogger(__name__)


class StickerCollectionAction(BaseAction):
    def __init__(self, db_session) -> None:
        super().__init__(db_session)
        self.sticker_collection_service = StickerCollectionService(db_session)

    def get_all(self) -> list[StickerCollectionDTO]:
        collections = self.sticker_collection_service.get_all()
        return [StickerCollectionDTO.from_orm(collection) for collection in collections]

    def create(self, dto: StickerCollectionDTO) -> StickerCollectionDTO:
        collection = self.sticker_collection_service.create(
            collection_id=dto.id,
            title=dto.title,
            description=dto.description,
            logo_url=dto.logo_url,
        )
        return StickerCollectionDTO.from_orm(collection)

    def get(self, collection_id: int) -> StickerCollectionDTO:
        try:
            collection = self.sticker_collection_service.get(collection_id)
        except NoResultFound:
            raise StickerCollectionNotFound(
                f"No sticker collection with id {collection_id!r} found."
            )
        return StickerCollectionDTO.from_orm(collection)

    def get_or_create(self, dto: StickerCollectionDTO) -> StickerCollectionDTO:
        try:
            return self.get(dto.id)
        except StickerCollectionNotFound:
            return self.create(dto)


class StickerCharacterAction(BaseAction):
    def __init__(self, db_session) -> None:
        super().__init__(db_session)
        self.sticker_character_service = StickerCharacterService(db_session)

    def get_all(self, collection_id: int | None) -> list[StickerCharacterDTO]:
        characters = self.sticker_character_service.get_all(collection_id=collection_id)
        return [StickerCharacterDTO.from_orm(character) for character in characters]

    async def get_all_grouped(self) -> list[MinimalStickerCollectionWithCharactersDTO]:
        characters = self.sticker_character_service.get_all()
        return [
            MinimalStickerCollectionWithCharactersDTO(
                id=collection.id,
                title=collection.title,
                logo_url=collection.logo_url,
                characters=[
                    MinimalStickerCharacterDTO.from_orm(character)
                    for character in characters
                ],
            )
            for collection, characters in itertools.groupby(
                characters, key=lambda x: x.collection
            )
        ]

    def create(self, dto: StickerCharacterDTO) -> StickerCharacterDTO:
        sticker_character = self.sticker_character_service.create(
            character_id=dto.id,
            collection_id=dto.collection_id,
            name=dto.name,
            description=dto.description,
            supply=dto.supply,
        )
        return StickerCharacterDTO.from_orm(sticker_character)

    def get(self, character_id: int) -> StickerCharacterDTO:
        try:
            character = self.sticker_character_service.get(character_id)
        except NoResultFound:
            raise StickerCharacterNotFound(
                f"No sticker character with id {character_id!r} found."
            )
        return StickerCharacterDTO.from_orm(character)

    def get_or_create(self, dto: StickerCharacterDTO) -> StickerCharacterDTO:
        try:
            return self.get(dto.id)
        except StickerCharacterNotFound:
            return self.create(dto)


class StickerItemAction(BaseAction):
    def __init__(self, db_session) -> None:
        super().__init__(db_session)
        self.sticker_collection_service = StickerCollectionService(db_session)
        self.sticker_item_service = StickerItemService(db_session)
        self.user_service = UserService(db_session)
        self.redis_service = RedisService()

    def get(self, item_id: str) -> StickerItemDTO:
        try:
            item = self.sticker_item_service.get(item_id)
        except NoResultFound:
            raise StickerNotFound(f"No sticker item with id {item_id!r} found.")
        return StickerItemDTO.from_orm(item)

    def get_all(self, user_id: int) -> list[StickerItemDTO]:
        stickers = self.sticker_item_service.get_all(user_id=user_id)
        return [StickerItemDTO.from_orm(sticker) for sticker in stickers]

    def create(self, dto: StickerItemDTO) -> StickerItemDTO:
        sticker = self.sticker_item_service.create(
            item_id=dto.item_id,
            collection_id=dto.collection_id,
            character_id=dto.character_id,
            user_id=dto.user_id,
            instance=dto.instance,
        )
        return StickerItemDTO.from_orm(sticker)

    def get_or_create(self, dto: StickerItemDTO) -> StickerItemDTO:
        try:
            return self.get(dto.item_id)
        except StickerNotFound:
            return self.create(dto)

    def update_ownership(self, item_id: str, user_id: int) -> StickerItemDTO:
        try:
            sticker = self.sticker_item_service.get(item_id)
        except NoResultFound:
            raise StickerNotFound(f"No sticker item with id {item_id!r} found.")
        updated_sticker = self.sticker_item_service.update(
            item=sticker,
            user_id=user_id,
        )
        return StickerItemDTO.from_orm(updated_sticker)
