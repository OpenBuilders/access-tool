import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from community_manager.actions.chat import CommunityManagerChatAction
from community_manager.events import ChatAdminChangeEventBuilder
from core.exceptions.chat import TelegramChatNotSufficientPrivileges
from core.dtos.chat import TelegramChatDTO
from tests.factories import TelegramChatFactory, TelegramChatUserFactory, UserFactory


@pytest.fixture
def chat_action(db_session, mocker):
    # Only mock external network/infrastructure dependencies
    mocker.patch("community_manager.actions.chat.RedisService")
    mocker.patch("community_manager.actions.chat.CDNService")
    mocker.patch("community_manager.actions.chat.TelethonService")

    action = CommunityManagerChatAction(db_session)
    return action


@pytest.mark.asyncio
async def test_on_bot_chat_member_update_transitions_to_insufficient(
    db_session, chat_action
):
    # Create models using existing factories
    chat = TelegramChatFactory.with_session(db_session).create(
        id=123,
        title="Test Chat",
        insufficient_privileges=False,
    )
    user = UserFactory.with_session(db_session).create(
        telegram_id=999,
        first_name="Test",
    )
    TelegramChatUserFactory.with_session(db_session).create(
        chat=chat,
        user=user,
        is_admin=True,
        is_manager_admin=True,
    )
    db_session.commit()

    chat_dto = TelegramChatDTO.from_object(chat)

    event = MagicMock(spec=ChatAdminChangeEventBuilder.Event)
    event.sufficient_bot_privileges = False
    event.new_participant = MagicMock()

    with patch(
        "community_manager.actions.chat.TelegramBotApiService"
    ) as MockBotService:
        mock_bot_service = AsyncMock()
        MockBotService.return_value.__aenter__.return_value = mock_bot_service

        await chat_action.on_bot_chat_member_update(event, chat_dto)

        # Verify the database state actually updated
        db_session.refresh(chat)
        assert chat.insufficient_privileges is True

        # Verify the message was sent to the owner
        mock_bot_service.send_message.assert_awaited_once()
        _, kwargs = mock_bot_service.send_message.call_args
        assert kwargs["chat_id"] == 999
        assert "Insufficient Privileges" in kwargs["text"]


@pytest.mark.asyncio
async def test_on_bot_chat_member_update_already_insufficient_no_notify(
    db_session, chat_action
):
    chat = TelegramChatFactory.with_session(db_session).create(
        id=123,
        title="Test Chat",
        insufficient_privileges=True,
    )
    db_session.commit()

    chat_dto = TelegramChatDTO.from_object(chat)

    event = MagicMock(spec=ChatAdminChangeEventBuilder.Event)
    event.sufficient_bot_privileges = False
    event.new_participant = MagicMock()

    with patch(
        "community_manager.actions.chat.TelegramBotApiService"
    ) as MockBotService:
        mock_bot_service = AsyncMock()
        MockBotService.return_value.__aenter__.return_value = mock_bot_service

        await chat_action.on_bot_chat_member_update(event, chat_dto)

        # Insufficient privileges should remain True
        db_session.refresh(chat)
        assert chat.insufficient_privileges is True

        # No new notification should be sent if it was already insufficient
        mock_bot_service.send_message.assert_not_called()


@pytest.mark.asyncio
async def test_on_bot_chat_member_update_transitions_to_sufficient(
    db_session, chat_action
):
    chat = TelegramChatFactory.with_session(db_session).create(
        id=123,
        title="Test Chat",
        insufficient_privileges=True,
    )
    db_session.commit()

    chat_dto = TelegramChatDTO.from_object(chat)

    event = MagicMock(spec=ChatAdminChangeEventBuilder.Event)
    event.sufficient_bot_privileges = True
    event.new_participant = MagicMock()

    with patch(
        "community_manager.actions.chat.TelegramBotApiService"
    ) as MockBotService:
        mock_bot_service = AsyncMock()
        MockBotService.return_value.__aenter__.return_value = mock_bot_service

        await chat_action.on_bot_chat_member_update(event, chat_dto)

        # Insufficient privileges should update to False
        db_session.refresh(chat)
        assert chat.insufficient_privileges is False

        # No warning notification sent when restoring sufficient privileges
        mock_bot_service.send_message.assert_not_called()


@pytest.mark.asyncio
async def test_refresh_transitions_to_insufficient(db_session, chat_action):
    chat = TelegramChatFactory.with_session(db_session).create(
        id=123,
        title="Test Chat",
        insufficient_privileges=False,
    )
    user = UserFactory.with_session(db_session).create(
        telegram_id=888,
        first_name="Test",
    )
    TelegramChatUserFactory.with_session(db_session).create(
        chat=chat,
        user=user,
        is_admin=True,
        is_manager_admin=True,
    )
    db_session.commit()

    chat_action._get_chat_data = AsyncMock(
        side_effect=TelegramChatNotSufficientPrivileges("Insufficient privileges")
    )

    with patch(
        "community_manager.actions.chat.TelegramBotApiService"
    ) as MockBotService:
        mock_bot_service = AsyncMock()
        MockBotService.return_value.__aenter__.return_value = mock_bot_service

        with pytest.raises(TelegramChatNotSufficientPrivileges):
            await chat_action._refresh(chat)

        # Verify the database state actually updated
        db_session.refresh(chat)
        assert chat.insufficient_privileges is True

        # Verify notification was sent
        mock_bot_service.send_message.assert_awaited_once()
        _, kwargs = mock_bot_service.send_message.call_args
        assert kwargs["chat_id"] == 888
        assert "Insufficient Privileges" in kwargs["text"]
