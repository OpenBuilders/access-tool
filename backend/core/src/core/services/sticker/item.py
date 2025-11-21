from typing import Iterable, Sequence, Any

from sqlalchemy import delete
from sqlalchemy.orm import load_only, QueryableAttribute

from core.models.sticker import StickerItem
from core.services.base import BaseService


class StickerItemService(BaseService):
    def get(self, item_id: str) -> StickerItem:
        return (
            self.db_session.query(StickerItem).filter(StickerItem.id == item_id).one()
        )

    def get_all(
        self,
        telegram_user_id: int | None = None,
        collection_id: int | None = None,
        character_id: int | None = None,
        item_ids: Iterable[str] | None = None,
        _load_attributes: list[QueryableAttribute[Any]] | None = None,
    ) -> list[StickerItem]:
        """
        Retrieve all sticker items based on provided filter criteria.

        This method filters sticker items from the database query based on the
        specified parameters.
        If a filter parameter is omitted, it will not restrict the query for that parameter.
        The function returns a list of all matching sticker items.

        :param telegram_user_id: The Telegram user ID to filter by.
            If None, this filter is not applied.
        :param collection_id: The collection ID to filter by.
            If None, this filter is not applied.
        :param character_id: The character ID to filter by.
            If None, this filter is not applied.
        :param item_ids: An iterable of item IDs to filter by.
            If None, this filter is not applied.
        :param _load_attributes: A list of attribute names to load for each StickerItem.
            If None, all attributes are loaded.
        :return: A list of `StickerItem` instances that match the specified criteria.
        """
        query = self.db_session.query(StickerItem)
        if telegram_user_id is not None:
            query = query.filter(StickerItem.telegram_user_id == telegram_user_id)
        if collection_id is not None:
            query = query.filter(StickerItem.collection_id == collection_id)
        if character_id is not None:
            query = query.filter(StickerItem.character_id == character_id)
        if item_ids is not None:
            query = query.filter(StickerItem.id.in_(item_ids))

        if _load_attributes:
            query = query.options(load_only(*_load_attributes))

        return query.all()

    def create(
        self,
        item_id: str,
        instance: int,
        collection_id: int,
        character_id: int,
        telegram_user_id: int,
    ) -> StickerItem:
        new_item = StickerItem(
            id=item_id,
            instance=instance,
            collection_id=collection_id,
            character_id=character_id,
            telegram_user_id=telegram_user_id,
        )
        self.db_session.add(new_item)
        self.db_session.commit()
        return new_item

    def update(
        self,
        item: StickerItem,
        telegram_user_id: int,
    ) -> StickerItem:
        item.telegram_user_id = telegram_user_id
        self.db_session.commit()
        return item

    def delete(self, item_id: str) -> None:
        self.db_session.query(StickerItem).filter(StickerItem.id == item_id).delete(
            synchronize_session="fetch"
        )

    def bulk_delete(
        self,
        item_ids: Iterable[str],
    ) -> Sequence[int]:
        """
        Deletes multiple sticker items from the database based on the provided item IDs.

        This function executes a batch deletion operation for sticker items using the
        given list of IDs and returns the corresponding `telegram_user_id` values for
        the deleted items.

        :param item_ids: An iterable of strings representing the IDs of the sticker
            items to be deleted.
        :return: A sequence of integers representing the `telegram_user_id` values
            of the deleted sticker items.
        """
        telegram_user_ids = (
            self.db_session.execute(
                delete(StickerItem)
                .where(StickerItem.id.in_(item_ids))
                .returning(StickerItem.telegram_user_id.distinct())
            )
            .scalars()
            .all()
        )
        return telegram_user_ids
