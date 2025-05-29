from collections import namedtuple

from sqlalchemy import select, func

from core.models.gift import GiftUnique
from core.services.base import BaseService


OptionsTuple = namedtuple("OptionsTuple", ["model", "backdrop", "pattern"])


class GiftUniqueService(BaseService):
    def get(self, slug: str) -> GiftUnique:
        return self.db_session.query(GiftUnique).filter(GiftUnique.slug == slug).one()

    def get_all(self, collection_slug: str) -> list[GiftUnique]:
        return (
            self.db_session.query(GiftUnique)
            .filter(
                GiftUnique.collection_slug == collection_slug,
            )
            .order_by(GiftUnique.number)
            .all()
        )

    def get_unique_options(self, collection_slug: str):
        query = select(
            func.array_agg(func.distinct(GiftUnique.model)).label("models"),
            func.array_agg(func.distinct(GiftUnique.backdrop)).label("backdrops"),
            func.array_agg(func.distinct(GiftUnique.pattern)).label("patterns"),
        ).where(GiftUnique.collection_slug == collection_slug)

        result = self.db_session.execute(query).first()

        return {
            "models": [m for m in result.models if m is not None],
            "backdrops": [b for b in result.backdrops if b is not None],
            "patterns": [p for p in result.patterns if p is not None],
        }

    def find(self, slug: str) -> GiftUnique | None:
        return self.db_session.query(GiftUnique).filter(GiftUnique.slug == slug).first()

    def create(
        self,
        slug: str,
        number: int,
        model: str,
        backdrop: str,
        pattern: str,
        telegram_owner_id: int | None,
        blockchain_address: str | None,
        owner_address: str | None,
    ) -> GiftUnique:
        new_unique = GiftUnique(
            slug=slug,
            number=number,
            model=model,
            backdrop=backdrop,
            pattern=pattern,
            telegram_owner_id=telegram_owner_id,
            blockchain_address=blockchain_address,
            owner_address=owner_address,
        )
        self.db_session.add(new_unique)
        self.db_session.commit()
        return new_unique

    def update(
        self,
        slug: str,
        number: int,
        model: str,
        backdrop: str,
        pattern: str,
        telegram_owner_id: int | None,
        blockchain_address: str | None,
        owner_address: str | None,
    ) -> GiftUnique:
        unique = self.get(slug)
        unique.number = number
        unique.model = model
        unique.backdrop = backdrop
        unique.pattern = pattern
        unique.telegram_owner_id = telegram_owner_id
        unique.blockchain_address = blockchain_address
        unique.owner_address = owner_address
        self.db_session.commit()

        return unique

    def update_ownership(
        self,
        slug: str,
        telegram_owner_id: int,
        blockchain_address: str | None,
        owner_address: str | None,
    ) -> GiftUnique:
        unique = self.get(slug)
        unique.telegram_owner_id = telegram_owner_id
        unique.blockchain_address = blockchain_address
        unique.owner_address = owner_address
        self.db_session.commit()

        return unique
