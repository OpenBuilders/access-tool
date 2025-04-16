from sqlalchemy.orm import joinedload

from core.models.sticker import StickerItem
from core.services.base import BaseService


class StickerItemService(BaseService):
    def get(self, item_id: str) -> StickerItem:
        return self.db_session.query(StickerItem.id == item_id).one()

    def get_all(
        self, user_id: int | None = None, collection_id: int | None = None
    ) -> list[StickerItem]:
        query = self.db_session.query(StickerItem)
        if user_id is not None:
            query = query.filter(StickerItem.user_id == user_id)
        if collection_id is not None:
            query = query.filter(StickerItem.collection_id == collection_id)

        query = query.options(
            joinedload(
                StickerItem.collection,
                StickerItem.user,
            )
        )

        return query.all()

    def create(
        self,
        item_id: str,
        instance: int,
        collection_id: int,
        user_id: int,
    ) -> StickerItem:
        new_item = StickerItem(
            id=item_id,
            instance=instance,
            collection_id=collection_id,
            user_id=user_id,
        )
        self.db_session.add(new_item)
        self.db_session.commit()
        return new_item

    def update(
        self,
        item: StickerItem,
        user_id: int,
    ) -> StickerItem:
        item.user_id = user_id
        self.db_session.commit()
        return item

    def delete(self, item_id: str) -> None:
        self.db_session.query(StickerItem).filter(StickerItem.id == item_id).delete(
            synchronize_session="fetch"
        )
