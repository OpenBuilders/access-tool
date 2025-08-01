import random
from unittest.mock import MagicMock, create_autospec, Mock

import pytest
from telethon import TelegramClient
from telethon.tl.types import User as TelethonUser, Chat

from core.constants import REQUIRED_BOT_PRIVILEGES


@pytest.fixture()
def telegram_chat_id() -> int:
    return 1234567890


@pytest.fixture()
def telegram_user_id() -> int:
    return 2345678901


@pytest.fixture()
def mocked_telethon_client() -> MagicMock:
    return create_autospec(
        TelegramClient,
        spec_set=True,
        instance=True,
    )


@pytest.fixture()
def mocked_telethon_user(telegram_user_id: int) -> MagicMock:
    return create_autospec(
        TelethonUser,
        instance=True,
        id=telegram_user_id,
        username="test_user",
        first_name="Test",
        last_name="User",
        premium=False,
        lang_code="en",
        bot=False,
        participant=Mock(),
    )


@pytest.fixture()
def mocked_telethon_chat(telegram_chat_id: int) -> MagicMock:
    return create_autospec(
        Chat,
        id=telegram_chat_id,
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


@pytest.fixture()
def telegram_chat_participants(telegram_user_id: int) -> list[TelethonUser]:
    participants_ids = [
        telegram_user_id,
        *(random.randint(10000, 10000000) for _ in range(10)),
    ]
    random.shuffle(participants_ids)
    return [create_autospec(TelethonUser, id=i) for i in participants_ids]
