from sqlalchemy.orm import Session

from core.services.nft import NftCollectionService
from tests.factories.nft import NFTCollectionFactory


def test_get_whitelisted_returns_enabled_collections(db_session: Session) -> None:
    enabled = [
        NFTCollectionFactory.with_session(db_session).create(is_enabled=True)
        for _ in range(2)
    ]
    NFTCollectionFactory.with_session(db_session).create(is_enabled=False)
    db_session.commit()

    assert {c.address for c in NftCollectionService(db_session).get_whitelisted()} == {
        c.address for c in enabled
    }
