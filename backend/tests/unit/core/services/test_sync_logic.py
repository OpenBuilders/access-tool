import pytest
from sqlalchemy.orm import Session

from core.models.blockchain import NftItem
from core.models.wallet import JettonWallet
from core.services.nft import NftItemService
from core.services.wallet import JettonWalletService
from tests.factories.jetton import JettonFactory
from tests.factories.nft import NFTCollectionFactory, NftItemFactory
from tests.factories.wallet import UserWalletFactory, JettonWalletFactory


@pytest.mark.usefixtures("db_session")
class TestSyncLogic:
    def test_jetton_wallet_delete_missing(self, db_session: Session):
        wallet = UserWalletFactory.with_session(db_session).create(
            address="0:wallet_address_123"
        )
        service = JettonWalletService(db_session)

        # Create Jettons
        jetton1 = JettonFactory.with_session(db_session).create()
        jetton2 = JettonFactory.with_session(db_session).create()

        # Create Wallets: 1 and 2 exist
        jw1 = JettonWalletFactory.with_session(db_session).create(
            owner_address=wallet.address,
            jetton=jetton1,
        )
        jw2 = JettonWalletFactory.with_session(db_session).create(
            owner_address=wallet.address,
            jetton=jetton2,
        )

        # Scenario: indexer returns only jw1 (so jw2 should be deleted)
        keep_addresses = [jw1.address]

        service.delete_missing(wallet.address, keep_addresses)

        # Verify jw1 still exists
        assert (
            db_session.query(JettonWallet).filter_by(address=jw1.address).one_or_none()
            is not None
        )
        # Verify jw2 is deleted
        assert (
            db_session.query(JettonWallet).filter_by(address=jw2.address).one_or_none()
            is None
        )

    def test_nft_item_delete_missing(self, db_session: Session):
        wallet = UserWalletFactory.with_session(db_session).create(
            address="0:wallet_address_123"
        )
        service = NftItemService(db_session)

        # Create Collection
        collection = NFTCollectionFactory.with_session(db_session).create()

        # Create NFT Items: 1 and 2 exist
        # Use simpler unique addresses respecting 67 char limit (0: + 64 chars)
        addr1 = "0:" + "1" * 64
        addr2 = "0:" + "2" * 64

        nft1 = NftItemFactory.with_session(db_session).create(
            owner_address=wallet.address,
            collection=collection,
            address=addr1,
        )
        nft2 = NftItemFactory.with_session(db_session).create(
            owner_address=wallet.address,
            collection=collection,
            address=addr2,
        )

        # Scenario: indexer returns only nft1 (so nft2 should be deleted)
        keep_addresses = [nft1.address]

        service.delete_missing(wallet.address, keep_addresses)

        # Verify nft1 still exists
        assert (
            db_session.query(NftItem).filter_by(address=nft1.address).one_or_none()
            is not None
        )
        # Verify nft2 is deleted
        assert (
            db_session.query(NftItem).filter_by(address=nft2.address).one_or_none()
            is None
        )

    def test_delete_missing_empty_keep_list(self, db_session: Session):
        """Test that passing an empty list deletes ALL items for that user."""
        wallet = UserWalletFactory.with_session(db_session).create(
            address="0:wallet_address_123"
        )
        service = JettonWalletService(db_session)

        jetton1 = JettonFactory.with_session(db_session).create()
        jw1 = JettonWalletFactory.with_session(db_session).create(
            owner_address=wallet.address,
            jetton=jetton1,
        )

        # Empty keep list
        service.delete_missing(wallet.address, [])

        assert (
            db_session.query(JettonWallet).filter_by(address=jw1.address).one_or_none()
            is None
        )
