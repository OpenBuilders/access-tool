from fastapi import HTTPException
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from core.actions.base import BaseAction
from core.dtos.base import BaseThresholdFilterDTO
from core.services.jetton import JettonService
from core.services.wallet import JettonWalletService, WalletService


class JettonWalletAction(BaseAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session)
        self.jetton_wallet_service = JettonWalletService(db_session)
        self.jetton_service = JettonService(db_session)
        self.wallet_service = WalletService(db_session)

    def get_holders_telegram_ids(
        self, address_raw: str, filters: BaseThresholdFilterDTO
    ) -> set[int]:
        """
        Get all holders of a jetton.
        """
        try:
            jetton = self.jetton_service.get(address_raw)
        except NoResultFound:
            raise HTTPException(
                detail=f"Jetton {address_raw!r} not found",
                status_code=404,
            )

        all_wallets = self.jetton_wallet_service.get_all(
            jetton_master_address=jetton.address,
            min_balance=filters.threshold,
        )

        holders_telegram_ids = self.wallet_service.get_owners_telegram_ids(
            addresses=[w.owner_address for w in all_wallets]
        )
        return holders_telegram_ids
