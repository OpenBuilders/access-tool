from collections.abc import AsyncIterator
from unittest.mock import create_autospec, AsyncMock

import pytest
from telethon import TelegramClient
from telethon.tl.types import Channel, User

from core.services.supertelethon import TelethonService


@pytest.mark.asyncio
async def test_kick_participant_missing_refresh_participants(
    mocked_telethon_client: TelegramClient,
    telegram_user_id: int,
    telegram_chat_id: int,
    telegram_chat_participants: list[User],
) -> None:
    mocked_telethon_client.get_entity = AsyncMock()
    mocked_telethon_client.get_entity.side_effect = [
        create_autospec(Channel),
        ValueError(
            f"Could not find the input entity for PeerUser(user_id={telegram_user_id})"
        ),
    ]

    async def mock_participants_iterator(*args, **kwargs) -> AsyncIterator[User]:
        for _user in telegram_chat_participants:
            yield _user

    mocked_telethon_client.iter_participants = mock_participants_iterator
    telethon_service = TelethonService(client=mocked_telethon_client)

    await telethon_service.kick_chat_member(
        chat_id=telegram_chat_id,
        telegram_user_id=telegram_user_id,
    )
