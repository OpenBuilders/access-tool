import pytest
from pytest_mock import MockerFixture
from sqlalchemy.orm import Session

from core.services.nft import NftItemService
from tests.factories.nft import NFTCollectionFactory, NftItemFactory
from tests.factories.wallet import UserWalletFactory


def _build_tonapi_nft_item(
    mocker: MockerFixture,
    *,
    address: str,
    owner_address: str,
    collection_address: str,
):
    nft_item = mocker.MagicMock()
    nft_item.address.to_raw.return_value = address
    nft_item.owner.address.to_raw.return_value = owner_address
    nft_item.collection.address.to_raw.return_value = collection_address
    return nft_item


def _build_tonapi_nft_items(items):
    container = type("NftItemsContainer", (), {})()
    container.nft_items = items
    return container


@pytest.fixture(autouse=True)
def _patch_metadata_dto(mocker: MockerFixture):
    mocker.patch(
        "core.services.nft.NftItemMetadataDTO.from_nft_item",
        return_value=None,
    )


def test_bulk_create_or_update_returns_previous_owner_on_ownership_change(
    db_session: Session, mocker: MockerFixture
) -> None:
    previous_wallet = UserWalletFactory.with_session(db_session).create()
    new_wallet = UserWalletFactory.with_session(db_session).create()
    nft = NftItemFactory.with_session(db_session).create(
        owner_address=previous_wallet.address
    )
    tonapi_nft = _build_tonapi_nft_item(
        mocker,
        address=nft.address,
        owner_address=new_wallet.address,
        collection_address=nft.collection_address,
    )

    persisted, evicted_owners = NftItemService(db_session).bulk_create_or_update(
        _build_tonapi_nft_items([tonapi_nft]),
        whitelist_collection_addresses=[nft.collection_address],
    )

    assert len(persisted) == 1
    assert persisted[0].owner_address == new_wallet.address
    assert evicted_owners == {previous_wallet.address}


def test_bulk_create_or_update_returns_empty_set_when_owner_unchanged(
    db_session: Session, mocker: MockerFixture
) -> None:
    wallet = UserWalletFactory.with_session(db_session).create()
    nft = NftItemFactory.with_session(db_session).create(owner_address=wallet.address)
    tonapi_nft = _build_tonapi_nft_item(
        mocker,
        address=nft.address,
        owner_address=wallet.address,
        collection_address=nft.collection_address,
    )

    _, evicted_owners = NftItemService(db_session).bulk_create_or_update(
        _build_tonapi_nft_items([tonapi_nft]),
        whitelist_collection_addresses=[nft.collection_address],
    )

    assert evicted_owners == set()


def test_bulk_create_or_update_returns_empty_set_for_brand_new_nft(
    db_session: Session, mocker: MockerFixture
) -> None:
    wallet = UserWalletFactory.with_session(db_session).create()
    collection = NFTCollectionFactory.with_session(db_session).create()
    tonapi_nft = _build_tonapi_nft_item(
        mocker,
        address="0:brand_new_nft_address_used_only_for_this_test_no_collisions_xx",
        owner_address=wallet.address,
        collection_address=collection.address,
    )

    persisted, evicted_owners = NftItemService(db_session).bulk_create_or_update(
        _build_tonapi_nft_items([tonapi_nft]),
        whitelist_collection_addresses=[collection.address],
    )

    assert len(persisted) == 1
    assert evicted_owners == set()


def test_bulk_create_or_update_skips_non_whitelisted_collections(
    db_session: Session, mocker: MockerFixture
) -> None:
    wallet = UserWalletFactory.with_session(db_session).create()
    collection = NFTCollectionFactory.with_session(db_session).create()
    tonapi_nft = _build_tonapi_nft_item(
        mocker,
        address="0:nonwhitelisted_collection_nft_used_only_for_this_unit_test_xx",
        owner_address=wallet.address,
        collection_address=collection.address,
    )

    persisted, evicted_owners = NftItemService(db_session).bulk_create_or_update(
        _build_tonapi_nft_items([tonapi_nft]),
        whitelist_collection_addresses=["0:some_other_whitelisted_collection_address"],
    )

    assert persisted == []
    assert evicted_owners == set()
