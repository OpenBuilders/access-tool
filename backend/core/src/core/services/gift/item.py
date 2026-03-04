from collections import namedtuple


from core.models.gift import GiftUnique
from core.services.base import BaseService


OptionsTuple = namedtuple("OptionsTuple", ["model", "backdrop", "pattern"])


class GiftUniqueService(BaseService):
    def get(self, id: int) -> GiftUnique:
        return self.db_session.query(GiftUnique).filter(GiftUnique.id == id).one()

    def get_all(
        self,
        collection_id: int | None = None,
        telegram_user_id: int | None = None,
        number_ge: int | None = None,
        number_le: int | None = None,
    ) -> list[GiftUnique]:
        query = self.db_session.query(GiftUnique)
        if collection_id:
            query = query.filter(GiftUnique.collection_id == collection_id)
        if telegram_user_id:
            query = query.filter(GiftUnique.telegram_owner_id == telegram_user_id)
        if number_ge:
            query = query.filter(GiftUnique.number >= number_ge)
        if number_le:
            query = query.filter(GiftUnique.number <= number_le)

        return query.order_by(GiftUnique.number).all()

    def find(self, id: int) -> GiftUnique | None:
        return self.db_session.query(GiftUnique).filter(GiftUnique.id == id).first()

    def create(
        self,
        id: int,
        number: int,
        model: str,
        backdrop: str,
        pattern: str,
        telegram_owner_id: int | None,
        blockchain_address: str | None,
        owner_address: str | None,
    ) -> GiftUnique:
        new_unique = GiftUnique(
            id=id,
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
        id: int,
        number: int,
        model: str,
        backdrop: str,
        pattern: str,
        telegram_owner_id: int | None,
        blockchain_address: str | None,
        owner_address: str | None,
    ) -> GiftUnique:
        unique = self.get(id)
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
        id: int,
        telegram_owner_id: int,
        blockchain_address: str | None,
        owner_address: str | None,
    ) -> GiftUnique:
        unique = self.get(id)
        unique.telegram_owner_id = telegram_owner_id
        unique.blockchain_address = blockchain_address
        unique.owner_address = owner_address
        self.db_session.flush()

        return unique

    def count(self) -> int:
        return self.db_session.query(GiftUnique).count()
