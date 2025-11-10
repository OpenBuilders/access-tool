import logging

from sqlalchemy import desc
from sqlalchemy.exc import NoResultFound

from core.dtos.resource import JettonDTO
from core.models.blockchain import Jetton
from core.services.base import BaseService


logger = logging.getLogger(__name__)


class JettonService(BaseService):
    def create(self, dto: JettonDTO) -> Jetton:
        jetton = Jetton(**dto.model_dump())
        self.db_session.add(jetton)
        self.db_session.commit()
        logger.info(f"Jetton {jetton.name!r} created.")
        return jetton

    def update(self, jetton: Jetton, dto: JettonDTO) -> Jetton:
        jetton.name = dto.name
        jetton.description = dto.description
        jetton.symbol = dto.symbol
        jetton.total_supply = dto.total_supply
        jetton.logo_path = dto.logo_path
        self.db_session.commit()
        logger.info(f"Jetton {jetton.name!r} updated.")
        return jetton

    def update_status(self, address: str, is_enabled: bool) -> Jetton:
        jetton = self.get(address=address)
        jetton.is_enabled = is_enabled
        self.db_session.commit()
        logger.info(f"Jetton {jetton.name!r} status updated.")
        return jetton

    def create_or_update(self, dto: JettonDTO) -> Jetton:
        try:
            jetton = self.get(address=dto.address)
            logger.info(f"Jetton {jetton.name!r} found. Updating jetton.")
            return self.update(jetton=jetton, dto=dto)
        except NoResultFound:
            logger.info(
                f"No jetton for address {dto.address!r} found. Creating new jetton."
            )
            jetton = self.create(dto)
            logger.info(f"Jetton {jetton.name!r} created.")
            return jetton

    def get(self, address: str) -> Jetton:
        return self.db_session.query(Jetton).filter(Jetton.address == address).one()

    def get_whitelisted(self) -> list[Jetton]:
        return (
            self.db_session.query(Jetton)
            .filter(Jetton.is_enabled.is_(True))
            .order_by(Jetton.created_at)
            .all()
        )

    def get_all(self, whitelisted_only: bool) -> list[Jetton]:
        query = self.db_session.query(Jetton)
        if whitelisted_only:
            query = query.filter(Jetton.is_enabled.is_(True))
            query = query.order_by(Jetton.created_at)
        else:
            query = query.order_by(desc(Jetton.is_enabled), Jetton.created_at)

        return query.all()

    def count(self) -> int:
        return self.db_session.query(Jetton).count()

    def batch_update_prices(self, prices: dict[str, float]) -> None:
        self.db_session.bulk_update_mappings(
            Jetton,
            [{"address": address, "price": price} for address, price in prices.items()],
        )
        self.db_session.flush()
        logger.info(f"Updated {len(prices)} jettons prices successfully")
