from core.models.gift import GiftCollection
from core.services.base import BaseService


class GiftCollectionService(BaseService):
    def get(self, slug: str) -> GiftCollection:
        return (
            self.db_session.query(GiftCollection)
            .filter(GiftCollection.slug == slug)
            .one()
        )

    def find(self, slug: str) -> GiftCollection | None:
        return (
            self.db_session.query(GiftCollection)
            .filter(GiftCollection.slug == slug)
            .first()
        )

    def create(
        self,
        slug: str,
        title: str,
        preview_url: str | None,
        supply: int | None,
        upgraded_count: int | None,
    ) -> GiftCollection:
        new_collection = GiftCollection(
            slug=slug,
            title=title,
            preview_url=preview_url,
            supply=supply,
            upgraded_count=upgraded_count,
        )
        self.db_session.add(new_collection)
        self.db_session.commit()

        return new_collection

    def update(
        self,
        slug: str,
        title: str,
        preview_url: str | None,
        supply: int | None,
        upgraded_count: int | None,
    ) -> GiftCollection:
        collection = self.get(slug)
        collection.title = title
        collection.preview_url = preview_url
        collection.supply = supply
        collection.upgraded_count = upgraded_count
        self.db_session.commit()

        return collection
