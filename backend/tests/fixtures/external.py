"""Fixtures for mocking external dependencies in tests."""
import pytest
from unittest.mock import MagicMock, AsyncMock


@pytest.fixture(autouse=True)
def mock_telegram_bot_api_service(mocker):
    """
    Mock TelegramBotApiService to prevent aiogram.Bot initialization in tests.

    This fixture is autouse=True, so it applies to all tests automatically.
    It patches TelegramBotApiService in the modules where it's imported,
    preventing token validation and Bot initialization during test runs.

    Production code will fail fast if token is missing, which is the desired behavior.
    """
    # Create a mock instance with properly configured methods
    mock_instance = MagicMock()

    # Configure create_chat_invite_link to return a mock with invite_link attribute
    mock_invite_link_result = MagicMock()
    mock_invite_link_result.invite_link = "https://t.me/+mock_invite_link"
    mock_instance.create_chat_invite_link = AsyncMock(
        return_value=mock_invite_link_result
    )

    # Patch in community_manager.actions.chat where it's imported
    mock_class = mocker.patch(
        "community_manager.actions.chat.TelegramBotApiService", autospec=True
    )
    mock_class.return_value = mock_instance

    return mock_instance
