from unittest.mock import MagicMock

import pytest
from pytest_mock import MockerFixture

from community_manager.gateway.service import TelegramGatewayService
from core.dtos.gateway import IndexChatCommand


def _participant(user_id: int, *, is_bot: bool = False) -> MagicMock:
    participant = MagicMock()
    participant.id = user_id
    participant.bot = is_bot
    return participant


async def _async_iter(items):
    for item in items:
        yield item


@pytest.fixture
def gateway_service(mocker: MockerFixture) -> TelegramGatewayService:
    telethon_service = MagicMock()
    service = TelegramGatewayService(telethon_service=telethon_service)
    mocker.patch("community_manager.gateway.service.SessionLocal", autospec=False)
    mocker.patch(
        "community_manager.gateway.service.TelegramUserDTO.from_telethon_user"
    )
    mocker.patch(
        "community_manager.gateway.service.is_chat_participant_admin",
        return_value=False,
    )
    mocker.patch(
        "community_manager.gateway.service.is_chat_participant_manager_admin",
        return_value=False,
    )
    return service


@pytest.mark.asyncio
async def test_handle_index_chat_runs_cleanup_when_no_errors(
    gateway_service: TelegramGatewayService, mocker: MockerFixture
) -> None:
    mocker.patch("community_manager.gateway.service.UserAction")
    mock_chat_user_service_cls = mocker.patch(
        "community_manager.gateway.service.TelegramChatUserService"
    )
    mock_chat_user_service = mock_chat_user_service_cls.return_value
    mock_app = mocker.patch("community_manager.gateway.service.app")

    gateway_service.telethon_service.get_participants.return_value = _async_iter(
        [_participant(101), _participant(202)]
    )

    await gateway_service._handle_index_chat(
        IndexChatCommand(chat_id=-100, cleanup=True)
    )

    mock_chat_user_service.delete_stale_participants.assert_called_once()
    mock_app.send_task.assert_called_once_with(
        "check-target-chat-members",
        args=(-100,),
        queue=mocker.ANY,
    )


@pytest.mark.asyncio
async def test_handle_index_chat_skips_cleanup_when_per_user_error(
    gateway_service: TelegramGatewayService, mocker: MockerFixture
) -> None:
    mock_user_action_cls = mocker.patch("community_manager.gateway.service.UserAction")
    mock_user_action_cls.return_value.create_or_update.side_effect = RuntimeError(
        "boom"
    )
    mock_chat_user_service_cls = mocker.patch(
        "community_manager.gateway.service.TelegramChatUserService"
    )
    mock_chat_user_service = mock_chat_user_service_cls.return_value
    mock_app = mocker.patch("community_manager.gateway.service.app")

    gateway_service.telethon_service.get_participants.return_value = _async_iter(
        [_participant(101)]
    )

    await gateway_service._handle_index_chat(
        IndexChatCommand(chat_id=-100, cleanup=True)
    )

    mock_chat_user_service.delete_stale_participants.assert_not_called()
    mock_app.send_task.assert_not_called()
