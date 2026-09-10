from sqlalchemy.orm import Session

from core.services.nft import NftCollectionService
from tests.factories.nft import NFTCollectionFactory


def test_get_whitelisted_returns_enabled_collection_addresses(
    db_session: Session,
) -> None:
    enabled = [
        NFTCollectionFactory.with_session(db_session).create(is_enabled=True)
        for _ in range(3)
    ]
    NFTCollectionFactory.with_session(db_session).create(is_enabled=False)
    db_session.commit()

    assert set(NftCollectionService(db_session).get_whitelisted()) == {
        collection.address for collection in enabled
    }


def test_get_whitelisted_skips_disabled_collections(db_session: Session) -> None:
    NFTCollectionFactory.with_session(db_session).create(is_enabled=False)
    db_session.commit()

    assert NftCollectionService(db_session).get_whitelisted() == []
