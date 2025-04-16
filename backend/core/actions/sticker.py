import logging
from collections import defaultdict

from sqlalchemy.exc import NoResultFound

from core.actions.base import BaseAction
from core.dtos.sticker import StickerCollectionDTO, StickerItemDTO
from core.exceptions.sticker import StickerCollectionNotFound, StickerNotFound
from core.models.user import User
from core.services.sticker.collection import StickerCollectionService
from core.services.sticker.item import StickerItemService
from core.services.user import UserService


logger = logging.getLogger(__name__)


class StickerCollectionAction(BaseAction):
    def __init__(self, db_session) -> None:
        super().__init__(db_session)
        self.sticker_collection_service = StickerCollectionService(db_session)

    def get_all(self):
        collections = self.sticker_collection_service.get_all()
        return [StickerCollectionDTO.from_orm(collection) for collection in collections]

    def create(self, dto: StickerCollectionDTO) -> StickerCollectionDTO:
        collection = self.sticker_collection_service.create(
            title=dto.title,
            description=dto.description,
            logo_url=dto.logo_url,
            supply=dto.supply,
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


class StickerItemAction(BaseAction):
    def __init__(self, db_session) -> None:
        super().__init__(db_session)
        self.sticker_collection_service = StickerCollectionService(db_session)
        self.sticker_item_service = StickerItemService(db_session)
        self.user_service = UserService(db_session)

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

    def batch_process_collection(
        self, collection_dto: StickerCollectionDTO, new_items: list[StickerItemDTO]
    ) -> set[User]:
        """
        Processes a batch of new sticker items for a sticker collection. Compares new items
        with the existing ones in the collection and performs the necessary operations such as
        creating new items when they do not exist or updating ownership information.

        :param collection_dto: Data transfer object representing the sticker collection
            that needs to be processed.
        :param new_items: List of new sticker item data transfer objects to be processed
            into the collection.

        :return: set of users that were targeted by the batch process (the ones that lost their sticker)
        """
        target_telegram_ids = list({new_item.user_id for new_item in new_items})
        all_users = self.user_service.get_all(telegram_ids=target_telegram_ids)
        all_users_by_telegram_id = {u.telegram_id: u for u in all_users}
        collection = self.sticker_collection_service.get(
            collection_id=collection_dto.id
        )
        previous_items = self.sticker_item_service.get_all(collection_id=collection.id)
        previous_items_by_id = {sticker.id: sticker for sticker in previous_items}

        updated_users = set()
        for new_item in new_items:
            if not (previous_item := previous_items_by_id.get(new_item.id)):
                logger.info(
                    f"Missing sticker item {new_item.id!r} for collection {collection.id!r}. Creating new item."
                )
                self.sticker_item_service.create(
                    item_id=new_item.id,
                    collection_id=collection.id,
                    user_id=new_item.user_id,
                    instance=new_item.instance,
                )
                continue

            target_user = all_users_by_telegram_id.get(new_item.user_id)
            if target_user and previous_item.user_id != target_user.id:
                logger.info(
                    f"Ownership of the sticker for item {new_item.id!r} in the collection {collection.id!r} changed "
                    f"from {target_user.id!r} to {new_item.user_id!r}. Updating ownership."
                )
                self.sticker_item_service.update(
                    item=previous_item,
                    user_id=new_item.user_id,
                )
                updated_users.add(target_user)

        return updated_users

    def batch_process(
        self, collections: list[StickerCollectionDTO], new_items: list[StickerItemDTO]
    ) -> set[User]:
        """
        Processes given collections and their associated new items by batching them into
        relevant groups and delegating further processing. This function organizes the
        provided items based on the collections they belong to and handles warnings for
        items without a valid collection.

        :param collections: List of StickerCollectionDTO objects representing collections to be processed.
        :param new_items: List of StickerItemDTO objects representing new items to be batched into collections.

        :return: set of users that were targeted by the batch process (the ones that lost their sticker)
        """
        items_by_collections = defaultdict(list)
        collections_by_id = {collection.id: collection for collection in collections}

        all_targeted_users = set()

        for item in new_items:
            collection = collections_by_id.get(item.collection_id)
            if not collection:
                logger.warning(
                    f"No collection found for item {item.id!r} despite item returned: {item.collection_id=!r}. Skipping. "
                )
                continue
            items_by_collections[collection].append(item)

        for collection, items in items_by_collections.items():
            targeted_users = self.batch_process_collection(
                collection_dto=collection, new_items=items
            )
            all_targeted_users += targeted_users

        return all_targeted_users
