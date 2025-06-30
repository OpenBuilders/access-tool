from unittest.mock import create_autospec

import pytest
from pytest_mock import MockerFixture
from pytonapi.schema._address import Address
from pytonapi.schema.jettons import JettonInfo
from sqlalchemy.orm import Session

from core.actions.jetton import JettonAction
from core.constants import DEFAULT_FILE_VERSION, DEFAULT_INCREMENTED_FILE_VERSION
from core.dtos.resource import JettonDTO
from core.models.blockchain import Jetton
from core.services.superredis import RedisService
from core.utils.file import VersionedFile
from tests.factories import JettonFactory


@pytest.mark.asyncio
async def test__prefetch_existing_jetton__pass(db_session: Session) -> None:
    """Test `prefetch` successfully returns existing Jetton from database."""
    # Arrange
    existing_jetton = JettonFactory()

    # Act
    jetton_action = JettonAction(db_session)
    result = await jetton_action.prefetch(existing_jetton.address)

    # Assert
    assert isinstance(result, JettonDTO)
    assert result.address == existing_jetton.address


@pytest.mark.asyncio
async def test__prefetch_missing_jetton_no_cache__pass(
    db_session: Session, mocker: MockerFixture, dummy_jetton_dto: JettonDTO
) -> None:
    """Test `prefetch` fetches blockchain info when Jetton doesn't exist in DB."""
    # Arrange

    jetton_action = JettonAction(db_session)
    jetton_action.redis_service = create_autospec(RedisService, instance=True)
    jetton_action.redis_service.get.return_value = None

    jetton_action._get_blockchain_info = mocker.AsyncMock(return_value=dummy_jetton_dto)

    # Act
    result = await jetton_action.prefetch(address_raw=dummy_jetton_dto.address)

    # Assert
    assert isinstance(result, JettonDTO)
    assert result.address == dummy_jetton_dto.address
    assert result.name == dummy_jetton_dto.name
    assert result.symbol == dummy_jetton_dto.symbol
    assert result.is_enabled is True
    jetton_action._get_blockchain_info.assert_called_once_with(
        address_raw=dummy_jetton_dto.address, version=DEFAULT_FILE_VERSION
    )


@pytest.mark.asyncio
async def test__prefetch_missing_jetton_with_cache__pass(
    db_session: Session,
    dummy_jetton_dto: JettonDTO,
) -> None:
    """Test `get_cached_blockchain_info` retrieves data from cache."""
    # Arrange
    cached_data = dummy_jetton_dto.model_dump_json()

    jetton_action = JettonAction(db_session)
    jetton_action.redis_service = create_autospec(RedisService, instance=True)
    jetton_action.redis_service.get.return_value = cached_data

    # Act
    result = await jetton_action.prefetch(dummy_jetton_dto.address)

    # Assert
    assert isinstance(result, JettonDTO)
    assert result.address == dummy_jetton_dto.address
    jetton_action.redis_service.get.assert_called_once_with(
        f"jetton:{dummy_jetton_dto.address}"
    )
    jetton_action.redis_service.set.assert_not_called()


@pytest.mark.asyncio
async def test__create_jetton__pass(
    db_session: Session,
    mocker: MockerFixture,
    dummy_jetton_info: JettonInfo,
) -> None:
    """Test `create` fetches and creates a Jetton."""
    # Arrange
    blockchain_dto = JettonDTO.from_info(dummy_jetton_info)

    jetton_action = JettonAction(db_session)
    jetton_action.get_cached_blockchain_info = mocker.AsyncMock(
        return_value=blockchain_dto
    )

    # Act
    result = await jetton_action.create(dummy_jetton_info.metadata.address.to_raw())

    # Assert
    assert isinstance(result, JettonDTO)
    assert result.address == dummy_jetton_info.metadata.address.to_raw()
    jetton_action.get_cached_blockchain_info.assert_called_once_with(
        dummy_jetton_info.metadata.address.to_raw(),
        version=DEFAULT_FILE_VERSION,
    )

    # Ensure DB record is created
    db_record = db_session.query(Jetton).one()
    assert db_record.address == dummy_jetton_info.metadata.address.to_raw()
    assert db_record.symbol == dummy_jetton_info.metadata.symbol
    assert db_record.name == dummy_jetton_info.metadata.name
    assert db_record.is_enabled is True, "Jetton is not enabled by default"


@pytest.mark.parametrize(
    ("initial_is_enabled", "provided_is_enabled", "expected_is_enabled"),
    [
        (True, True, True),
        (False, True, True),
        (True, False, False),
        (False, False, False),
    ],
)
@pytest.mark.asyncio
async def test__update_jetton_status__pass(
    db_session: Session,
    dummy_jetton_address: Address,
    initial_is_enabled: bool,
    provided_is_enabled: bool,
    expected_is_enabled: bool,
) -> None:
    """Test `update` modifies the status of an existing Jetton."""
    # Arrange
    updated_jetton = JettonFactory(
        address=dummy_jetton_address.to_raw(),
        is_enabled=initial_is_enabled,
    )

    jetton_action = JettonAction(db_session)
    # Act
    result = await jetton_action.update(
        updated_jetton.address,
        is_enabled=provided_is_enabled,
    )

    # Assert
    assert isinstance(result, JettonDTO)
    assert result.address == updated_jetton.address
    assert result.is_enabled == expected_is_enabled

    # Ensure it reflected in DB
    db_record = db_session.query(Jetton).one()
    assert db_record.is_enabled == expected_is_enabled


@pytest.mark.asyncio
async def test__get_or_create_existing_jetton__pass(db_session: Session) -> None:
    """Test `get_or_create` returns an existing Jetton from the database."""
    # Arrange
    jetton = JettonFactory()
    jetton_action = JettonAction(db_session)

    # Act
    result = await jetton_action.get_or_create(jetton.address)

    # Assert
    assert isinstance(result, JettonDTO)
    assert result.name == jetton.name
    assert result.address == jetton.address
    assert result.symbol == jetton.symbol
    assert result.is_enabled == jetton.is_enabled


@pytest.mark.asyncio
async def test_get_or_create_create_new_jetton(
    db_session: Session,
    mocker: MockerFixture,
    dummy_jetton_info: JettonInfo,
) -> None:
    """Test `get_or_create` creates and returns a new Jetton."""
    # Arrange
    new_jetton = JettonDTO.from_info(dummy_jetton_info)

    jetton_action = JettonAction(db_session)
    jetton_action.get_cached_blockchain_info = mocker.AsyncMock(return_value=new_jetton)

    assert db_session.query(Jetton).count() == 0, "There should be no existing Jettons"

    # Act
    result = await jetton_action.get_or_create(new_jetton.address)

    # Assert
    assert result == new_jetton
    jetton_action.get_cached_blockchain_info.assert_called_once_with(
        new_jetton.address, version=DEFAULT_FILE_VERSION
    )

    db_record = db_session.query(Jetton).one()
    assert db_record.address == new_jetton.address
    assert db_record.symbol == new_jetton.symbol
    assert db_record.name == new_jetton.name
    assert db_record.is_enabled is True, "Jetton is not enabled by default"


@pytest.mark.asyncio
async def test_refresh__pass(
    db_session: Session,
    mocker: MockerFixture,
) -> None:
    jetton = JettonFactory.create()

    jetton_dto = JettonDTO.from_orm(jetton)
    jetton_dto.name = "New Jetton Name"

    jetton_record = db_session.query(Jetton).one()
    assert jetton_record.name != jetton_dto.name, "Jetton name should not match"

    jetton_action = JettonAction(db_session)
    jetton_action.redis_service = create_autospec(RedisService, instance=True)
    jetton_action.redis_service.get.return_value = None

    jetton_action._get_blockchain_info = mocker.AsyncMock(return_value=jetton_dto)
    await jetton_action.refresh(jetton.address)

    jetton_action._get_blockchain_info.assert_called_once_with(
        jetton.address,
        version=DEFAULT_INCREMENTED_FILE_VERSION,
    )

    updated_jetton_record = db_session.query(Jetton).one()
    assert updated_jetton_record.name == jetton_dto.name


@pytest.mark.asyncio
async def test_refresh__cache_hit__pass(
    db_session: Session, mocker: MockerFixture
) -> None:
    jetton = JettonFactory.create()

    jetton_dto = JettonDTO.from_orm(jetton)
    jetton_dto.name = "New Jetton Name"

    jetton_record = db_session.query(Jetton).one()
    assert jetton_record.name != jetton_dto.name, "Jetton name should not match"

    jetton_action = JettonAction(db_session)
    jetton_action.redis_service = create_autospec(RedisService, instance=True)
    jetton_action.redis_service.get.return_value = jetton_dto.model_dump_json()

    jetton_action._get_blockchain_info = mocker.AsyncMock(return_value=jetton_dto)

    await jetton_action.refresh(jetton.address)

    jetton_action.redis_service.get.assert_not_called()
    jetton_action.redis_service.set.assert_called_once_with(
        f"refresh_details_{jetton.address}", "1", ex=3600, nx=True
    )
    jetton_action._get_blockchain_info.assert_called_once_with(
        jetton.address,
        version=DEFAULT_INCREMENTED_FILE_VERSION,
    )

    updated_jetton_record = db_session.query(Jetton).one()
    assert updated_jetton_record.name == jetton_dto.name


@pytest.mark.parametrize(
    ("previous_logo_path", "expected_logo_path"),
    (
        ("fren.png", "fren.png?v=2"),
        ("fren.png?v=1", "fren.png?v=2"),
        ("fren.png?v=2", "fren.png?v=3"),
    ),
)
@pytest.mark.asyncio
async def test_refresh__increments_file_version__pass(
    db_session: Session,
    mocker: MockerFixture,
    previous_logo_path: str,
    expected_logo_path: str,
) -> None:
    jetton = JettonFactory.create(logo_path=previous_logo_path)

    jetton_record = db_session.query(Jetton).one()
    assert isinstance(jetton_record.logo_path, str)
    assert (
        jetton_record.logo_path == previous_logo_path
    ), "Jetton logo path should match"

    jetton_action = JettonAction(db_session)
    jetton_action.redis_service = create_autospec(RedisService, instance=True)
    jetton_action.redis_service.get.return_value = None

    logo_path_obj = VersionedFile.from_filename(previous_logo_path)
    jetton_dto = JettonDTO.from_orm(jetton)
    new_version = logo_path_obj.get_next_version()
    logo_path_obj._version = new_version
    jetton_dto.logo_path = logo_path_obj.full_name
    jetton_action._get_blockchain_info = mocker.AsyncMock(return_value=jetton_dto)
    await jetton_action.refresh(jetton.address)

    jetton_action._get_blockchain_info.assert_called_once_with(
        jetton.address,
        version=new_version,
    )

    updated_jetton_record = db_session.query(Jetton).one()
    assert isinstance(updated_jetton_record.logo_path, str)
    new_path = VersionedFile.from_filename(updated_jetton_record.logo_path)
    assert new_path.base_name == logo_path_obj.base_name
    assert new_path.version == logo_path_obj.version
    assert new_path.extension == logo_path_obj.extension
