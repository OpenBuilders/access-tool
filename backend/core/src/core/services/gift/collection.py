from core.models.gift import GiftCollection
from core.services.base import BaseService


class GiftCollectionService(BaseService):
    def get(self, id: int) -> GiftCollection:
        return (
            self.db_session.query(GiftCollection).filter(GiftCollection.id == id).one()
        )

    def get_all(self, ids: list[int] | None = None) -> list[GiftCollection]:
        query = self.db_session.query(GiftCollection)
        if ids:
            query = query.filter(GiftCollection.id.in_(ids))
        result = query.order_by(GiftCollection.id).all()
        return result

    def find(self, id: int) -> GiftCollection | None:
        return (
            self.db_session.query(GiftCollection)
            .filter(GiftCollection.id == id)
            .first()
        )

    def create(
        self,
        id: int,
        title: str,
        preview_url: str | None,
        supply: int | None,
        upgraded_count: int | None,
    ) -> GiftCollection:
        new_collection = GiftCollection(
            id=id,
            title=title,
            preview_url=preview_url,
            supply=supply,
            upgraded_count=upgraded_count,
        )
        self.db_session.add(new_collection)
        self.db_session.flush()

        return new_collection

    def update(
        self,
        id: int,
        title: str,
        preview_url: str | None,
        supply: int | None,
        upgraded_count: int | None,
    ) -> GiftCollection:
        collection = self.get(id)
        collection.title = title
        collection.preview_url = preview_url
        collection.supply = supply
        collection.upgraded_count = upgraded_count
        self.db_session.flush()

        return collection
