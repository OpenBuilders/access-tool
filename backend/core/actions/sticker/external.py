import hashlib
import logging

from sqlalchemy.orm import Session

from core.actions.base import BaseAction
from core.dtos.sticker import (
    StickerDomCollectionWithCharacters,
    ExternalStickerDomCollectionOwnershipDTO,
    StickerItemDTO,
    ExternalStickerItemDTO,
)
from core.services.sticker.character import StickerCharacterService
from core.services.sticker.collection import StickerCollectionService
from core.services.sticker.item import StickerItemService
from core.services.superredis import RedisService


logger = logging.getLogger(__name__)


class ExternalStickerAction(BaseAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session)
        self.sticker_collection_service = StickerCollectionService(
            db_session=db_session
        )
        self.sticker_character_service = StickerCharacterService(db_session=db_session)
        self.sticker_item_service = StickerItemService(db_session=db_session)
        self.redis_service = RedisService()

    @staticmethod
    def get_metadata_cache_key(collection_id: int) -> str:
        return f"sticker-dom::{collection_id}::ownership-metadata"

    @staticmethod
    def get_data_cache_key(collection_id: int) -> str:
        return f"sticker-dom::{collection_id}::ownership-data"

    @staticmethod
    def get_collections_cache_key() -> str:
        return "sticker-dom::collections"

    @staticmethod
    def get_collection_cache_value(
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

    def map_external_data_to_internal(
        self, collection_id: int, items: list[ExternalStickerItemDTO]
    ) -> list[StickerItemDTO]:
        """
        Maps external data to internal data format for stickers by integrating external data items
        with internal user and character references. The method filters out items that lack a corresponding
        internal user or character mapping, logging appropriate debug or warning messages in such cases.

        :param collection_id: Unique identifier for the sticker collection.
        :type collection_id: int
        :param items: List of external sticker items to be mapped to the internal format.
        :type items: list[ExternalStickerItemDTO]
        :return: A list of StickerItemDTO instances representing the mapped internal sticker items.
        :rtype: list[StickerItemDTO]
        """
        target_telegram_ids = list({new_item.user_id for new_item in items})
        all_users = self.user_service.get_all(telegram_ids=target_telegram_ids)
        all_users_by_telegram_id = {u.telegram_id: u for u in all_users}

        characters = self.sticker_character_service.get_all(collection_id=collection_id)
        characters_by_external_id = {
            character.external_id: character for character in characters
        }

        internally_mapped_items = []

        for item in items:
            if not (internal_user := all_users_by_telegram_id.get(item.user_id)):
                # We don't handle records for the users outside the internal database.
                logger.debug(
                    f"Missing user {item.user_id!r} for collection {collection_id!r}. Skipping item."
                )
                continue

            if not (character := characters_by_external_id.get(item.character_id)):
                # There is a desynchronization between Sticker Dom and the database.
                logger.warning(
                    f"Missing character {item.character_id!r} for collection {collection_id!r}. Skipping item."
                )
                continue

            internally_mapped_items.append(
                StickerItemDTO(
                    id=item.id,
                    collection_id=collection_id,
                    character_id=character.id,
                    user_id=internal_user.id,
                    instance=item.instance,
                )
            )
        return internally_mapped_items

    def get_cached_user_ownership_data(self, user_id: int) -> list[StickerItemDTO]:
        """
        Fetches cached ownership data for a specific user by analyzing all available sticker collections
        and their respective cache records. The method iterates through all sticker collections,
        retrieves cached ownership data for each collection from the Redis service, and finds
        the records matching the given user ID.

        :param user_id: The unique Telegram ID of the user whose ownership data is being fetched
        :return: A list of StickerDomCollectionOwnershipDTO objects representing the ownership
                 data of the provided user across different sticker collections.
        """
        user_ownership_records = []
        collections = self.sticker_collection_service.get_all()
        for collection in collections:
            cache_key = self.get_data_cache_key(collection.id)
            raw_ownership_info = self.redis_service.get(cache_key)
            if raw_ownership_info is None:
                continue

            ownership_info = (
                ExternalStickerDomCollectionOwnershipDTO.model_validate_json(
                    raw_ownership_info
                )
            )
            mapped_ownership_items = self.map_external_data_to_internal(
                collection_id=collection.id,
                items=ownership_info.ownership_data,
            )
            for item in mapped_ownership_items:
                if item.user_id == user_id:
                    user_ownership_records.append(item)

        return user_ownership_records

    def index_user_ownership_data(self, user_id: int) -> None:
        """
        Indexes a user's sticker item ownership data by comparing cached ownership data
        and current records. Updates the current records by adding missing sticker items
        and removing outdated ones.

        :param user_id: The unique identifier for the user whose ownership data is to be indexed.
        :return: None
        """

        def _map_sticker_items(
            items: list[StickerItemDTO],
        ) -> dict[str, StickerItemDTO]:
            """
            Reusable method to map sticker items so they could be easily compared.
            :param items: List of sticker items that should be mapped.
            :return: Mapping where the key is an item's ID and the value is a sticker item object.
            """
            return {item.id: item for item in items}

        user = self.user_service.get(user_id)
        ownership_data = self.get_cached_user_ownership_data(user.id)
        logger.info(
            f"Found {len(ownership_data)} sticker items for user {user.id!r} in cache."
        )
        mapped_ownership_data = _map_sticker_items(ownership_data)
        current_records = self.sticker_item_service.get_all(user_id=user_id)
        mapped_current_records = _map_sticker_items(
            [StickerItemDTO.from_orm(item) for item in current_records]
        )
        for key, value in mapped_ownership_data.items():
            if key not in mapped_current_records:
                logger.info(f"Found new sticker item {value.id!r} for user {user_id!r}")
                self.sticker_item_service.create(
                    item_id=value.id,
                    collection_id=value.collection_id,
                    character_id=value.character_id,
                    user_id=value.user_id,
                    instance=value.instance,
                )

        removed_records = set(mapped_current_records.keys()) - set(
            mapped_ownership_data.keys()
        )
        if removed_records:
            logger.info(
                f"Found removed sticker items {removed_records!r} for user {user_id!r}"
            )
            self.sticker_item_service.bulk_delete(removed_records)
