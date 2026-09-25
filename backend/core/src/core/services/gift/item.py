from collections import namedtuple


from core.models.gift import GiftUnique
from core.services.base import BaseService


OptionsTuple = namedtuple("OptionsTuple", ["model", "backdrop", "pattern"])


class GiftUniqueService(BaseService):
    def get(self, slug: str) -> GiftUnique:
        return self.db_session.query(GiftUnique).filter(GiftUnique.slug == slug).one()

    def get_all(
        self,
        collection_id: int | None = None,
        telegram_user_id: int | None = None,
    ) -> list[GiftUnique]:
        query = self.db_session.query(GiftUnique)
        if collection_id:
            query = query.filter(GiftUnique.collection_id == collection_id)
        if telegram_user_id:
            query = query.filter(GiftUnique.telegram_owner_id == telegram_user_id)

        return query.order_by(GiftUnique.number).all()

    def find(self, slug: str) -> GiftUnique | None:
        return self.db_session.query(GiftUnique).filter(GiftUnique.slug == slug).first()

    def create(
        self,
        slug: str,
        collection_id: int,
        number: int,
        model: str | None = None,
        backdrop: str | None = None,
        pattern: str | None = None,
        telegram_owner_id: int | None = None,
        blockchain_address: str | None = None,
        owner_address: str | None = None,
    ) -> GiftUnique:
        new_unique = GiftUnique(
            slug=slug,
            collection_id=collection_id,
            number=number,
            model=model,
            backdrop=backdrop,
            pattern=pattern,
            telegram_owner_id=telegram_owner_id,
            blockchain_address=blockchain_address,
            owner_address=owner_address,
        )
        self.db_session.add(new_unique)
        self.db_session.flush()
        return new_unique

    def update(
        self,
        slug: str,
        number: int,
        model: str | None = None,
        backdrop: str | None = None,
        pattern: str | None = None,
        telegram_owner_id: int | None = None,
        blockchain_address: str | None = None,
        owner_address: str | None = None,
    ) -> GiftUnique:
        unique = self.get(slug)
        unique.number = number
        unique.model = model
        unique.backdrop = backdrop
        unique.pattern = pattern
        unique.telegram_owner_id = telegram_owner_id
        unique.blockchain_address = blockchain_address
        unique.owner_address = owner_address
        self.db_session.flush()

        return unique

    def update_ownership(
        self,
        slug: str,
        telegram_owner_id: int | None,
        blockchain_address: str | None,
        owner_address: str | None,
    ) -> GiftUnique:
        unique = self.get(slug)
        unique.telegram_owner_id = telegram_owner_id
        unique.blockchain_address = blockchain_address
        unique.owner_address = owner_address
        self.db_session.flush()

        return unique

    def count(self) -> int:
        return self.db_session.query(GiftUnique).count()
