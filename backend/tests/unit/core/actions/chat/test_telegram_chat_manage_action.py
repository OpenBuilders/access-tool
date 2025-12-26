import pytest
from pytest_mock import MockerFixture
from sqlalchemy.orm import Session
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_429_TOO_MANY_REQUESTS,
    HTTP_502_BAD_GATEWAY,
)
from fastapi import HTTPException

from core.actions.chat import TelegramChatManageAction
from core.models.chat import TelegramChat
from tests.factories import UserFactory, TelegramChatFactory, TelegramChatUserFactory


from core.constants import CELERY_SYSTEM_QUEUE_NAME


@pytest.fixture
def managed_chat_action(db_session: Session) -> TelegramChatManageAction:
    """Fixture to provide a TelegramChatManageAction instance with a managed chat."""
    user = UserFactory.with_session(db_session).create()
    chat = TelegramChatFactory.with_session(db_session).create(
        insufficient_privileges=False, is_full_control=False
    )
    TelegramChatUserFactory.with_session(db_session).create(
        chat=chat, user=user, is_admin=True
    )
    return TelegramChatManageAction(db_session, user, chat.slug)


@pytest.mark.asyncio
async def test_set_control_level_success(
    db_session: Session,
    managed_chat_action: TelegramChatManageAction,
    mocker: MockerFixture,
) -> None:
    """Test successful update of control level."""
    # Arrange
    effective_days = 7
    mock_redis = mocker.patch("core.actions.chat.RedisService")
    mock_redis.return_value.set.return_value = True

    # Mock task sending and waiting
    mock_sender = mocker.patch("core.actions.chat.sender")
    mock_wait_for_task = mocker.patch("core.actions.chat.wait_for_task")
    mock_wait_for_task.return_value = True  # Task succeeds

    # Act
    result = await managed_chat_action.set_control_level(
        is_fully_managed=True, effective_in_days=effective_days
    )

    # Assert
    assert result.is_full_control is True

    # Verify DB update
    db_chat = db_session.query(TelegramChat).get(managed_chat_action.chat.id)
    assert db_chat.is_full_control is True

    # Verify Redis call
    mock_redis.return_value.set.assert_called_once()

    # Verify Celery task
    mock_sender.send_task.assert_called_once_with(
        "notify-chat-mode-changed",
        args=(managed_chat_action.chat.id, True, effective_days),
        queue=CELERY_SYSTEM_QUEUE_NAME,
    )


@pytest.mark.asyncio
async def test_set_control_level_insufficient_privileges(
    db_session: Session,
    managed_chat_action: TelegramChatManageAction,
) -> None:
    """Test setting control level when chat has insufficient privileges."""
    # Arrange
    managed_chat_action.chat.insufficient_privileges = True
    db_session.flush()

    # Act & Assert
    with pytest.raises(HTTPException) as exc:
        await managed_chat_action.set_control_level(
            is_fully_managed=True, effective_in_days=7
        )

    assert exc.value.status_code == HTTP_400_BAD_REQUEST
    assert exc.value.detail == "Insufficient privileges for bot in the chat"


@pytest.mark.asyncio
async def test_set_control_level_idempotency(
    db_session: Session,
    managed_chat_action: TelegramChatManageAction,
    mocker: MockerFixture,
) -> None:
    """Test that setting same value returns early without side effects."""
    # Arrange
    managed_chat_action.chat.is_full_control = True
    db_session.flush()

    mock_redis = mocker.patch("core.actions.chat.RedisService")
    mock_sender = mocker.patch("core.actions.chat.sender")

    # Act
    result = await managed_chat_action.set_control_level(
        is_fully_managed=True, effective_in_days=7
    )

    # Assert
    assert result.is_full_control is True
    mock_redis.return_value.set.assert_not_called()
    mock_sender.send_task.assert_not_called()


@pytest.mark.asyncio
async def test_set_control_level_rate_limit(
    db_session: Session,
    managed_chat_action: TelegramChatManageAction,
    mocker: MockerFixture,
) -> None:
    """Test rate limiting prevents spamming updates."""
    # Arrange
    mock_redis = mocker.patch("core.actions.chat.RedisService")
    # Simulate Redis key already set (action blocked)
    mock_redis.return_value.set.return_value = False

    # Act & Assert
    with pytest.raises(HTTPException) as exc:
        await managed_chat_action.set_control_level(
            is_fully_managed=True, effective_in_days=7
        )

    assert exc.value.status_code == HTTP_429_TOO_MANY_REQUESTS
    assert exc.value.detail == "Too many requests"


@pytest.mark.asyncio
async def test_set_control_level_celery_failure(
    db_session: Session,
    managed_chat_action: TelegramChatManageAction,
    mocker: MockerFixture,
) -> None:
    """Test handling of Celery task failure."""
    # Arrange
    mock_redis = mocker.patch("core.actions.chat.RedisService")
    mock_redis.return_value.set.return_value = True

    mocker.patch("core.actions.chat.sender")
    mock_wait_for_task = mocker.patch("core.actions.chat.wait_for_task")
    mock_wait_for_task.return_value = False  # Task fails

    # Act & Assert
    with pytest.raises(
        HTTPException,
        match="Something went wrong while changing the chat mode. Please, try again later.",
    ) as exc:
        await managed_chat_action.set_control_level(
            is_fully_managed=True, effective_in_days=7
        )

    assert exc.value.status_code == HTTP_502_BAD_GATEWAY
