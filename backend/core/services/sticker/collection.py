from core.models.sticker import StickerCollection
from core.services.base import BaseService


class StickerCollectionService(BaseService):
    def get(self, collection_id: int) -> StickerCollection:
        return (
            self.db_session.query(StickerCollection)
            .filter(StickerCollection.id == collection_id)
            .one()
        )

    def get_all(self) -> list[StickerCollection]:
        return (
            self.db_session.query(StickerCollection)
            .order_by(StickerCollection.title)
            .all()
        )

    def create(
        self,
        collection_id: int,
        title: str,
        description: str,
        logo_url: str,
    ) -> StickerCollection:
        new_collection = StickerCollection(
            id=collection_id,
            title=title,
            description=description,
            logo_url=logo_url,
        )
        self.db_session.add(new_collection)
        self.db_session.commit()
        return new_collection

    def update(
        self,
        collection: StickerCollection,
        title: str,
        description: str,
        logo_url: str,
    ) -> StickerCollection:
        collection.title = title
        collection.description = description
        collection.logo_url = logo_url
        self.db_session.commit()
        return collection

    def delete(self, collection_id: int) -> None:
        self.db_session.query(StickerCollection).filter(
            StickerCollection.id == collection_id
        ).delete(synchronize_session="fetch")
