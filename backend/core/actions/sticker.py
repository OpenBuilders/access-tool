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
    StickerDomCollectionOwnershipMetadataDTO,
    StickerDomCollectionOwnershipDTO,
)
from core.exceptions.sticker import StickerCollectionNotFound, StickerNotFound
from core.models.user import User
from core.services.sticker.character import StickerCharacterService
from core.services.sticker.collection import StickerCollectionService
from core.services.sticker.item import StickerItemService
from core.services.stickerdom import StickerDomService
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
                characters=[
                    MinimalStickerCharacterDTO.from_orm(character)
                    for character in characters
                ],
            )
            for collection, characters in itertools.groupby(
                characters, key=lambda x: x.collection
            )
        ]


class StickerItemAction(BaseAction):
    def __init__(self, db_session) -> None:
        super().__init__(db_session)
        self.sticker_collection_service = StickerCollectionService(db_session)
        self.sticker_item_service = StickerItemService(db_session)
        self.user_service = UserService(db_session)
        self.sticker_dom_service = StickerDomService()
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

    @staticmethod
    def _get_metadata_cache_key(collection_id: int) -> str:
        return f"sticker-dom::{collection_id}::ownership-metadata"

    @staticmethod
    def _get_data_cache_key(collection_id: int) -> str:
        return f"sticker-dom::{collection_id}::ownership-data"

    async def get_updated_ownership_info(
        self, collection_id: int
    ) -> StickerDomCollectionOwnershipDTO | None:
        """
        Fetch and return updated collection ownership information if it has changed.

        This method retrieves the current metadata for a collection and compares it with cached metadata.
        If the metadata has not changed, the method skips the update and returns None. Otherwise, it fetches
        the ownership data, updates the cache, and returns the latest data. Metadata cache is refreshed
        approximately every 6 hours to ensure the data remains up-to-date.

        :param collection_id: Unique identifier of the sticker collection for which ownership information
            is required.
        :return: Updated ownership information for the collection or None if metadata is unchanged.
        """
        metadata = await self.sticker_dom_service.fetch_collection_ownership_metadata(
            collection_id=collection_id
        )
        metadata_cache_key = self._get_metadata_cache_key(collection_id=collection_id)
        cached_metadata_raw = self.redis_service.get(metadata_cache_key)

        if (
            cached_metadata_raw is not None
            and (
                cached_metadata
                := StickerDomCollectionOwnershipMetadataDTO.model_validate_json(
                    cached_metadata_raw
                )
            )
            == metadata
        ):
            logger.debug(
                f"Metadata is unchanged, skipping: {cached_metadata} vs {metadata}"
            )
            return None

        ownership_data = await self.sticker_dom_service.fetch_collection_ownership_data(
            metadata=metadata
        )
        # Set the cache for the ownership data so it could be reused to avoid heavy decryption operations.
        self.redis_service.set(
            self._get_data_cache_key(collection_id=collection_id),
            ownership_data.model_dump_json(),
        )
        # At the very end, set the cache for the metadata with expiry set to 6 hours.
        # It'll help to ensure that at least every 6 hours the list is refreshed if needed
        self.redis_service.set(
            metadata_cache_key, metadata.model_dump_json(), ex=6 * 60 * 60
        )
        return ownership_data

    async def batch_process_collection(
        self, collection_dto: StickerCollectionDTO
    ) -> set[User]:
        """
        Batch processes a sticker collection by updating ownership information and
        handling changes in sticker items within the collection.
        This function retrieves ownership metadata updates, identifies changes, and adjusts the
        corresponding data in the system, including creating new items or updating user
        ownership as needed.

        :param collection_dto: Data transfer object containing information about
            the sticker collection to be processed.
        :return: A set of users whose sticker ownership was updated during the
            batch processing of the given collection.
        """
        if (
            new_items := await self.get_updated_ownership_info(
                collection_id=collection_dto.id
            )
        ) is None:
            logger.warning(
                f"No updated metadata found for collection {collection_dto.id!r}. Skipping batch process."
            )
            return set()

        target_telegram_ids = list(
            {new_item.user_id for new_item in new_items.ownership_data}
        )
        all_users = self.user_service.get_all(telegram_ids=target_telegram_ids)
        all_users_by_telegram_id = {u.telegram_id: u for u in all_users}
        collection = self.sticker_collection_service.get(
            collection_id=collection_dto.id
        )
        previous_items = self.sticker_item_service.get_all(collection_id=collection.id)
        previous_items_by_id = {sticker.id: sticker for sticker in previous_items}

        updated_users = set()
        for new_item in new_items.ownership_data:
            if not (internal_user := all_users_by_telegram_id.get(new_item.user_id)):
                # We don't handle records for the users outside the internal database.
                logger.info(
                    f"Missing user {new_item.user_id!r} for collection {collection.id!r}. Skipping item."
                )
                continue

            if not (previous_item := previous_items_by_id.get(new_item.id)):
                logger.info(
                    f"Missing sticker item {new_item.id!r} for collection {collection.id!r}. Creating new item."
                )
                self.sticker_item_service.create(
                    item_id=new_item.id,
                    collection_id=collection.id,
                    character_id=new_item.character_id,
                    user_id=internal_user.id,
                    instance=new_item.instance,
                )
                # No need to inform about any updates as no ownership reduction has occurred.
                continue

            if previous_item.user_id != internal_user.id:
                logger.info(
                    f"Ownership of the sticker for item {new_item.id!r} in the collection {collection.id!r} changed "
                    f"from {previous_item.user_id!r} to {internal_user.id!r}. Updating ownership."
                )
                previous_user = previous_item.user
                self.sticker_item_service.update(
                    item=previous_item,
                    user_id=new_item.user_id,
                )
                # We should inform that for some user the sticker ownership has changed.
                # We don't have to do this for the new user as they got more sticker items.
                # But we should do that for the previous user as they have fewer sticker items now.
                updated_users.add(previous_user)

        return updated_users

    async def batch_process_all(
        self,
        collections: list[StickerCollectionDTO],
    ) -> set[User]:
        """
        Processes a batch of sticker collections asynchronously and aggregates the
        targeted users from all the collections.

        This method iterates through each provided sticker collection, processes it
        using the `batch_process_collection` method, and updates a set with all the
        users targeted by each collection.
        The result is a unique set of users targeted by all processed collections.

        :param collections:
            The list of StickerCollectionDTO objects representing the sticker
            collections to process.
        :return:
            A set containing all unique User objects targeted across the provided
            collections.
        """
        all_targeted_users = set()

        for collection in collections:
            targeted_users = await self.batch_process_collection(
                collection_dto=collection
            )
            all_targeted_users.update(targeted_users)

        return all_targeted_users
