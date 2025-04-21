from unittest.mock import MagicMock, create_autospec, Mock

import pytest
from telethon import TelegramClient
from telethon.tl.types import User as TelethonUser, Chat

from core.constants import REQUIRED_BOT_PRIVILEGES


@pytest.fixture()
def mocked_telethon_client() -> MagicMock:
    return create_autospec(
        TelegramClient,
        spec_set=True,
        instance=True,
    )


@pytest.fixture()
def mocked_telethon_user() -> MagicMock:
    return create_autospec(
        TelethonUser,
        instance=True,
        id=1234,
        username="test_user",
        first_name="Test",
        last_name="User",
        premium=False,
        lang_code="en",
        bot=False,
        participant=Mock(),
    )


@pytest.fixture()
def mocked_telethon_chat() -> MagicMock:
    return create_autospec(
        Chat,
        id=1234,
        title="Test chat",
        username=None,
        forum=False,
        admin_rights=Mock(),
    )


@pytest.fixture()
def mocked_telethon_chat_sufficient_rights(
    mocked_telethon_chat: MagicMock,
) -> MagicMock:
    mocked_telethon_chat.admin_rights = MagicMock(
        **{right: True for right in REQUIRED_BOT_PRIVILEGES}
    )
    return mocked_telethon_chat
