import logging
from collections.abc import Generator

from pytonapi.schema.jettons import JettonBalance, JettonsBalances
from sqlalchemy.exc import NoResultFound, IntegrityError
from sqlalchemy.orm import joinedload

from core.exceptions.wallet import (
    UserWalletConnectedError,
    UserWalletConnectedAnotherUserError,
)
from core.models.blockchain import Jetton
from core.models.wallet import UserWallet, JettonWallet, TelegramChatUserWallet
from core.services.base import BaseService


logger = logging.getLogger(__name__)


class WalletService(BaseService):
    def connect_user_wallet(self, user_id: int, wallet_address: str) -> UserWallet:
        existing_user_wallet = self.get_user_wallet(wallet_address)
        if existing_user_wallet:
            raise UserWalletConnectedError(
                f"User {user_id} is trying to connect already connected wallet {wallet_address}"
            )

        try:
            new_wallet = UserWallet(user_id=user_id, address=wallet_address)
            self.db_session.add(new_wallet)
            self.db_session.commit()
            return new_wallet
        except IntegrityError:
            self.db_session.rollback()
            raise UserWalletConnectedAnotherUserError(
                f"User {user_id} already has a connected wallet {wallet_address}"
            )

    def get_all(self, addresses: list[str] | None = None) -> list[UserWallet]:
        query = self.db_session.query(UserWallet)

        if addresses:
            query = query.filter(UserWallet.address.in_(addresses))

        return query.all()

    def get_all_wallet_addresses(self) -> Generator[str, None, None]:
        query = self.db_session.query(UserWallet.address).all()
        return (str(address[0]) for address in query)

    def get_user_wallet(
        self, wallet_address: str, user_id: int | None = None
    ) -> UserWallet | None:
        query = self.db_session.query(UserWallet)
        query = query.filter(UserWallet.address == wallet_address)
        if user_id is not None:
            query = query.filter(UserWallet.user_id == user_id)

        return query.first()

    def disconnect_user_wallet(self, user_id: int) -> None:
        self.db_session.query(UserWallet).filter(
            UserWallet.user_id == user_id,
        ).delete()
        self.db_session.commit()

    def turn_visibility_on(self, user_id: int) -> None:
        self.db_session.query(UserWallet).filter(
            UserWallet.user_id == user_id,
        ).update({"hide_wallet": False})
        self.db_session.commit()

    def turn_visibility_off(self, user_id: int) -> None:
        self.db_session.query(UserWallet).filter(
            UserWallet.user_id == user_id,
        ).update({"hide_wallet": True})
        self.db_session.commit()

    def set_balance(self, address_raw: str, balance: int) -> None:
        """
        Updates the balance for a specific wallet address using the database session.

        This method queries the `UserWallet` table using the provided wallet address,
        then updates the balance column with the specified value. It does not return
        any value but modifies the data in the database.

        :param address_raw: The wallet address whose balance needs to be updated.
        :param balance: The new balance to be set for the given wallet address in nano
        """
        self.db_session.query(UserWallet).filter(
            UserWallet.address == address_raw,
        ).update({"balance": balance})


class TelegramChatUserWalletService(BaseService):
    def has_wallet_connected(self, user_id: int, chat_id: int) -> bool:
        return (
            self.db_session.query(TelegramChatUserWallet)
            .filter(
                TelegramChatUserWallet.user_id == user_id,
                TelegramChatUserWallet.chat_id == chat_id,
            )
            .count()
            > 0
        )

    def connect(
        self, user_id: int, chat_id: int, wallet_address: str
    ) -> TelegramChatUserWallet:
        new_link = TelegramChatUserWallet(
            user_id=user_id, chat_id=chat_id, address=wallet_address
        )
        self.db_session.add(new_link)
        self.db_session.commit()
        return new_link

    def disconnect(self, user_id: int, chat_id: int) -> None:
        self.db_session.query(TelegramChatUserWallet).filter(
            TelegramChatUserWallet.user_id == user_id,
            TelegramChatUserWallet.chat_id == chat_id,
        ).delete(synchronize_session=False)
        self.db_session.commit()

    def get(self, user_id: int, chat_id: int) -> TelegramChatUserWallet:
        return (
            self.db_session.query(TelegramChatUserWallet)
            .options(joinedload(TelegramChatUserWallet.wallet))
            .filter(
                TelegramChatUserWallet.user_id == user_id,
                TelegramChatUserWallet.chat_id == chat_id,
            )
            .one()
        )

    def get_all(
        self, addresses: list[str] | None = None
    ) -> list[TelegramChatUserWallet]:
        query = self.db_session.query(TelegramChatUserWallet)
        if addresses:
            query = query.filter(TelegramChatUserWallet.address.in_(addresses))
        return query.all()


class JettonWalletService(BaseService):
    def _create(
        self, jetton_balance: JettonBalance, owner_address: str
    ) -> JettonWallet:
        jetton_wallet = JettonWallet(
            address=jetton_balance.wallet_address.address.to_raw(),
            jetton_master_address=jetton_balance.jetton.address.to_raw(),
            owner_address=owner_address,
            balance=int(jetton_balance.balance),
        )
        self.db_session.add(jetton_wallet)
        logger.debug(f"Jetton Wallet {jetton_wallet.address!r} created.")
        return jetton_wallet

    def _update(
        self, jetton_wallet: JettonWallet, jetton_balance: JettonBalance
    ) -> JettonWallet:
        jetton_wallet.balance = int(jetton_balance.balance)
        self.db_session.add(jetton_wallet)
        logger.debug(f"Jetton Wallet {jetton_wallet.address!r} updated.")
        return jetton_wallet

    def get(self, address: str) -> JettonWallet:
        return (
            self.db_session.query(JettonWallet)
            .filter(JettonWallet.address == address)
            .one()
        )

    def get_by_owner_address(
        self, owner_address: str, jetton_master_address: str
    ) -> JettonWallet:
        return (
            self.db_session.query(JettonWallet)
            .filter(JettonWallet.owner_address == owner_address)
            .filter(JettonWallet.jetton_master_address == jetton_master_address)
            .one()
        )

    def get_all(self, owner_address: str) -> list[JettonWallet]:
        return (
            self.db_session.query(JettonWallet)
            .filter(JettonWallet.owner_address == owner_address)
            .all()
        )

    def _create_or_update(
        self, jetton_balance: JettonBalance, owner_address: str
    ) -> JettonWallet:
        try:
            jetton_wallet = self.get(jetton_balance.wallet_address.address.to_raw())
            return self._update(
                jetton_wallet=jetton_wallet, jetton_balance=jetton_balance
            )
        except NoResultFound:
            logger.debug(
                f"No Jetton Wallet for address {jetton_balance.wallet_address.address!r} found. Creating new Jetton Wallet."
            )
            return self._create(jetton_balance, owner_address)

    def bulk_create_or_update(
        self,
        jettons_balances: JettonsBalances,
        whitelisted_jettons: list[Jetton],
        owner_address: str,
    ) -> list[JettonWallet]:
        """
        Create or update Jetton Wallets for the given JettonsBalances

        :param jettons_balances: list of JettonBalances
        :param whitelisted_jettons: jettons that should be refreshed
        :param owner_address: address of the wallet owner
        :return: list of created or updated Jetton Wallets
        """
        whitelist_addresses = [jetton.address for jetton in whitelisted_jettons]

        jetton_wallets = []
        for jetton_balance in jettons_balances.balances:
            if jetton_balance.jetton.address.to_raw() not in whitelist_addresses:
                continue
            jetton_wallet = self._create_or_update(
                jetton_balance, owner_address=owner_address
            )
            jetton_wallets.append(jetton_wallet)
        self.db_session.commit()
        logger.debug(
            "Created/updated %s Jetton Wallets for user %s",
            len(jetton_wallets),
            owner_address,
        )
        return jetton_wallets
