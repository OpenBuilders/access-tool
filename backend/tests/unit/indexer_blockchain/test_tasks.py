from contextlib import contextmanager
import pytest
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.orm import Session

from core.models.wallet import UserWallet
from pytonapi.schema.jettons import JettonsBalances
from pytonapi.schema.nft import NftItems
from indexer_blockchain.tasks import fetch_wallet_details
from tests.factories.wallet import UserWalletFactory


@pytest.fixture(autouse=True)
def mock_redis_service(mocker):
    return mocker.patch("indexer_blockchain.tasks.RedisService")


@pytest.fixture(autouse=True)
def mock_db_session(db_session, mocker):
    @contextmanager
    def _mock_session():
        yield db_session

    return mocker.patch(
        "indexer_blockchain.tasks.DBService.db_session", side_effect=_mock_session
    )


@pytest.mark.usefixtures("db_session")
class TestIndexerTasks:
    def test_fetch_wallet_details_initial_sync(self, db_session: Session, mocker):
        # 1. Arrange: Create wallet with last_activity = None
        raw_address = (
            "0:1111111111111111111111111111111111111111111111111111111111111111"
        )
        UserWalletFactory.with_session(db_session).create(
            address=raw_address,
            last_activity=None,
        )
        db_session.commit()

        # Mock TonApiService
        mock_service_class = mocker.patch("indexer_blockchain.tasks.TonApiService")
        mock_service = mock_service_class.return_value

        # Mock get_account_info
        account_info = MagicMock()
        account_info.last_activity = 123456
        account_info.balance = 1000000000
        account_info.address.to_raw.return_value = raw_address
        mock_service.get_account_info = AsyncMock(return_value=account_info)

        # Mock get_all_jetton_balances
        mock_service.get_all_jetton_balances = AsyncMock(
            return_value=JettonsBalances(balances=[])
        )

        # Mock get_all_nft_items_for_user as async generator
        async def mock_get_nfts(*args, **kwargs):
            yield NftItems(nft_items=[])

        mock_service.get_all_nft_items_for_user = mock_get_nfts

        # 2. Act
        fetch_wallet_details(raw_address)

        # 3. Assert: All external services called, and last_activity updated in DB
        mock_service.get_account_info.assert_called_once_with(raw_address)
        mock_service.get_all_jetton_balances.assert_called_once_with(raw_address)

        db_session.expire_all()
        updated_wallet = (
            db_session.query(UserWallet).filter_by(address=raw_address).one()
        )
        assert updated_wallet.last_activity == 123456
        assert updated_wallet.balance == 1000000000

    def test_fetch_wallet_details_skips_when_last_activity_unchanged(
        self, db_session: Session, mocker
    ):
        # 1. Arrange: Create wallet with last_activity = 123456
        raw_address = (
            "0:2222222222222222222222222222222222222222222222222222222222222222"
        )
        UserWalletFactory.with_session(db_session).create(
            address=raw_address,
            last_activity=123456,
            balance=5000000000,
        )
        db_session.commit()

        # Mock TonApiService
        mock_service_class = mocker.patch("indexer_blockchain.tasks.TonApiService")
        mock_service = mock_service_class.return_value

        # Mock get_account_info (same last_activity)
        account_info = MagicMock()
        account_info.last_activity = 123456
        account_info.balance = 5000000000
        account_info.address.to_raw.return_value = raw_address
        mock_service.get_account_info = AsyncMock(return_value=account_info)

        # Mock other methods to ensure we fail if they are called
        mock_service.get_all_jetton_balances = AsyncMock()
        mock_service.get_all_nft_items_for_user = MagicMock()

        # 2. Act
        fetch_wallet_details(raw_address)

        # 3. Assert: get_account_info called, but others skipped
        mock_service.get_account_info.assert_called_once_with(raw_address)
        mock_service.get_all_jetton_balances.assert_not_called()
        mock_service.get_all_nft_items_for_user.assert_not_called()

        db_session.expire_all()
        updated_wallet = (
            db_session.query(UserWallet).filter_by(address=raw_address).one()
        )
        assert updated_wallet.last_activity == 123456
        assert updated_wallet.balance == 5000000000

    def test_fetch_wallet_details_syncs_when_last_activity_changed(
        self, db_session: Session, mocker
    ):
        # 1. Arrange: Create wallet with last_activity = 123456
        raw_address = (
            "0:3333333333333333333333333333333333333333333333333333333333333333"
        )
        UserWalletFactory.with_session(db_session).create(
            address=raw_address,
            last_activity=123456,
            balance=5000000000,
        )
        db_session.commit()

        # Mock TonApiService
        mock_service_class = mocker.patch("indexer_blockchain.tasks.TonApiService")
        mock_service = mock_service_class.return_value

        # Mock get_account_info (new last_activity = 999999)
        account_info = MagicMock()
        account_info.last_activity = 999999
        account_info.balance = 6000000000
        account_info.address.to_raw.return_value = raw_address
        mock_service.get_account_info = AsyncMock(return_value=account_info)

        # Mock get_all_jetton_balances
        mock_service.get_all_jetton_balances = AsyncMock(
            return_value=JettonsBalances(balances=[])
        )

        # Mock get_all_nft_items_for_user as async generator
        async def mock_get_nfts(*args, **kwargs):
            yield NftItems(nft_items=[])

        mock_service.get_all_nft_items_for_user = mock_get_nfts

        # 2. Act
        fetch_wallet_details(raw_address)

        # 3. Assert: All external services called, and last_activity updated in DB
        mock_service.get_account_info.assert_called_once_with(raw_address)
        mock_service.get_all_jetton_balances.assert_called_once_with(raw_address)

        db_session.expire_all()
        updated_wallet = (
            db_session.query(UserWallet).filter_by(address=raw_address).one()
        )
        assert updated_wallet.last_activity == 999999
        assert updated_wallet.balance == 6000000000
