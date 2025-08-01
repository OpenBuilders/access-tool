import random
from typing import AsyncIterator
from unittest.mock import create_autospec, AsyncMock

import pytest
from telethon import TelegramClient
from telethon.tl.types import Channel, User

from core.services.supertelethon import TelethonService


@pytest.fixture()
def mocked_telegram_client() -> TelegramClient:
    return create_autospec(
        TelegramClient,
        spec_set=True,
        instance=True,
    )


@pytest.fixture()
def telegram_chat_id() -> int:
    return 1234567890


@pytest.fixture()
def telegram_user_id() -> int:
    return 2345678901


@pytest.fixture()
def telegram_chat_participants(telegram_user_id: int) -> list[User]:
    participants_ids = [
        telegram_user_id,
        *(random.randint(10000, 10000000) for _ in range(10)),
    ]
    random.shuffle(participants_ids)
    return [create_autospec(User, id=i) for i in participants_ids]


@pytest.mark.asyncio
async def test_kick_participant_missing_refresh_participants(
    mocked_telegram_client: TelegramClient,
    telegram_user_id: int,
    telegram_chat_id: int,
    telegram_chat_participants: list[User],
) -> None:
    mocked_telegram_client.get_entity = AsyncMock()
    mocked_telegram_client.get_entity.side_effect = [
        create_autospec(Channel),
        ValueError(
            f"Could not find the input entity for PeerUser(user_id={telegram_user_id})"
        ),
    ]

    async def mock_participants_iterator(*args, **kwargs) -> AsyncIterator[User]:
        for _user in telegram_chat_participants:
            yield _user

    mocked_telegram_client.iter_participants = mock_participants_iterator
    telethon_service = TelethonService(client=mocked_telegram_client)

    await telethon_service.kick_chat_member(
        chat_id=telegram_chat_id,
        telegram_user_id=telegram_user_id,
    )
