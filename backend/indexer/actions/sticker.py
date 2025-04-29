import hashlib
import logging

from sqlalchemy.orm import Session

from core.dtos.sticker import (
    StickerDomCollectionOwnershipDTO,
    StickerDomCollectionOwnershipMetadataDTO,
    StickerCollectionDTO,
    StickerDomCollectionWithCharacters,
)
from core.services.sticker.character import StickerCharacterService
from core.services.sticker.collection import StickerCollectionService
from core.services.sticker.item import StickerItemService
from core.services.superredis import RedisService
from core.services.user import UserService
from indexer.indexers.stickerdom import StickerDomService


logger = logging.getLogger(__name__)


class IndexerStickerItemAction:
    def __init__(self, db_session: Session) -> None:
        self.sticker_dom_service = StickerDomService()
        self.sticker_collection_service = StickerCollectionService(
            db_session=db_session
        )
        self.sticker_character_service = StickerCharacterService(db_session=db_session)
        self.sticker_item_service = StickerItemService(db_session=db_session)
        self.user_service = UserService(db_session=db_session)
        self.redis_service = RedisService()

    @staticmethod
    def __get_metadata_cache_key(collection_id: int) -> str:
        return f"sticker-dom::{collection_id}::ownership-metadata"

    @staticmethod
    def __get_data_cache_key(collection_id: int) -> str:
        return f"sticker-dom::{collection_id}::ownership-data"

    @staticmethod
    def __get_collections_cache_key() -> str:
        return "sticker-dom::collections"

    @staticmethod
    def __get_collection_cache_value(
        collections: list[StickerDomCollectionWithCharacters],
    ) -> str:
        """
        Generates a hash value based on the serialized data of the provided
        collections.
        This method is used for caching purposes by converting the data to its
        JSON representation, concatenating it, and producing an SHA-256 hash.

        :param collections: A list of StickerDomCollectionWithCharacters
            instances representing the collections whose hash is to be
            generated.
        :return: A string representing the SHA-256 hash of the serialized
            collections' data.
        """
        # Get hash of the serialized collections data
        collections_raw = "".join(
            [collection.model_dump_json() for collection in collections]
        )
        hash_object = hashlib.sha256(collections_raw.encode())
        return hash_object.hexdigest()

    async def _get_updated_collections(
        self,
    ) -> list[StickerDomCollectionWithCharacters] | None:
        """
        Fetches updated sticker collections and checks for any changes compared to the cached value.
        If the collections from the service match the cached value, the method skips returning new
        data and logs a message indicating no changes.
        Otherwise, it returns the updated collections.

        :return: List of updated StickerDomCollectionWithCharacters objects, or None if the collections
                 are unchanged.
        """
        collections = await self.sticker_dom_service.fetch_collections()
        collections_cache_key = self.__get_collections_cache_key()
        collections_cache_value = self.__get_collection_cache_value(collections)

        current_collections_cache_value = self.redis_service.get(collections_cache_key)
        if current_collections_cache_value == collections_cache_value:
            logger.debug("Collections are unchanged, skipping")
            return None

        return collections

    async def refresh_collections(self) -> None:
        """
        Handles the refreshing of sticker collections and their respective characters by fetching the
        most updated data available from the source, comparing it against the locally stored information,
        and ensuring that only the necessary updates are performed.
        The updated data is cached upon successful processing.

        This method aims to ensure the local storage remains synchronized with the most recent
        information about sticker collections and their characters, minimizing redundant updates by
        checking against the current state.
        """
        if (collections := await self._get_updated_collections()) is None:
            logger.info("No updated collections info found, skipping")
            return None

        current_collections = self.sticker_collection_service.get_all()
        current_collections_by_id = {
            collection.id: collection for collection in current_collections
        }

        current_characters = self.sticker_character_service.get_all()
        current_characters_by_id = {
            # On StickerDom, character ID is unique in the scope of a collection only
            (character.collection_id, character.external_id): character
            for character in current_characters
        }

        for collection in collections:
            # Create or update collections
            if not (current_collection := current_collections_by_id.get(collection.id)):
                logger.info(
                    f"New collection found: {collection.title=!r} ({collection.id=!r})"
                )
                self.sticker_collection_service.create(
                    collection_id=collection.id,
                    title=collection.title,
                    description=collection.description,
                    logo_url=collection.logo_url,
                )
            else:
                if self.sticker_collection_service.is_update_required(
                    collection=current_collection,
                    title=collection.title,
                    description=collection.description,
                    logo_url=collection.logo_url,
                ):
                    logger.info(f"Collection {collection.id=} has changed. Updating...")
                    self.sticker_collection_service.update(
                        collection=current_collection,
                        title=collection.title,
                        description=collection.description,
                        logo_url=collection.logo_url,
                    )

            # Create or update characters related to the target collection
            for character in collection.characters:
                if not (
                    current_character := current_characters_by_id.get(
                        (character.collection_id, character.id)
                    )
                ):
                    logger.info(
                        f"New character found: {character.name=!r} ({character.id=!r}) for collection {collection.id=!r}"
                    )
                    self.sticker_character_service.create(
                        character_id=character.id,
                        collection_id=character.collection_id,
                        name=character.name,
                        description=character.description,
                        supply=character.supply,
                        logo_url=character.logo_url,
                    )
                else:
                    if self.sticker_character_service.is_update_required(
                        character=current_character,
                        name=character.name,
                        description=character.description,
                        supply=character.supply,
                        logo_url=character.logo_url,
                    ):
                        logger.info(
                            f"Character {character.id=} for collection {collection.id=} has changed. Updating..."
                        )
                        self.sticker_character_service.update(
                            character=current_character,
                            name=character.name,
                            description=character.description,
                            supply=character.supply,
                            logo_url=character.logo_url,
                        )

        # Set cache only on successful processing
        self.redis_service.set(
            self.__get_collections_cache_key(),
            self.__get_collection_cache_value(collections),
        )
        logger.info("Successfully updated collections")
        return None

    async def _get_updated_ownership_info(
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
        if not metadata:
            return None

        metadata_cache_key = self.__get_metadata_cache_key(collection_id=collection_id)
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
            self.__get_data_cache_key(collection_id=collection_id),
            ownership_data.model_dump_json(),
        )
        # At the very end, set the cache for the metadata with expiry set to 6 hours.
        # It'll help to ensure that at least every 6 hours the list is refreshed if needed
        self.redis_service.set(
            metadata_cache_key, metadata.model_dump_json(), ex=6 * 60 * 60
        )
        return ownership_data

    async def process_collection_ownerships(
        self, collection_dto: StickerCollectionDTO
    ) -> set[int]:
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
            new_items := await self._get_updated_ownership_info(
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

        updated_users_ids = set()

        characters = self.sticker_character_service.get_all(collection_id=collection.id)
        characters_by_external_id = {
            character.external_id: character for character in characters
        }

        for new_item in new_items.ownership_data:
            if not (internal_user := all_users_by_telegram_id.get(new_item.user_id)):
                # We don't handle records for the users outside the internal database.
                logger.debug(
                    f"Missing user {new_item.user_id!r} for collection {collection.id!r}. Skipping item."
                )
                continue

            if not (character := characters_by_external_id.get(new_item.character_id)):
                # There is a desynchronization between Sticker Dom and the database.
                logger.warning(
                    f"Missing character {new_item.character_id!r} for collection {collection.id!r}. Skipping item."
                )
                continue

            if not (previous_item := previous_items_by_id.get(new_item.id)):
                logger.info(
                    f"Found new sticker item {new_item.id!r} for collection {collection.id!r} "
                    f"with owner {internal_user.id!r}. Creating new item."
                )
                self.sticker_item_service.create(
                    item_id=new_item.id,
                    collection_id=collection.id,
                    character_id=character.id,
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
                previous_user_id = previous_item.user_id
                self.sticker_item_service.update(
                    item=previous_item,
                    user_id=new_item.user_id,
                )
                # We should inform that for some user the sticker ownership has changed.
                # We don't have to do this for the new user as they got more sticker items.
                # But we should do that for the previous user as they have fewer sticker items now.
                updated_users_ids.add(previous_user_id)

        return updated_users_ids

    async def refresh_ownerships(
        self,
        collections: list[StickerCollectionDTO],
    ) -> set[int]:
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
            A set containing all unique user IDs targeted across the provided
            collections.
        """
        all_targeted_users_ids = set()

        for collection in collections:
            targeted_users = await self.process_collection_ownerships(
                collection_dto=collection
            )
            all_targeted_users_ids.update(targeted_users)

        return all_targeted_users_ids
