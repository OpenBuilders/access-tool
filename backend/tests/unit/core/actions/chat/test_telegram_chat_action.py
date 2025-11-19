from unittest.mock import AsyncMock, MagicMock, Mock

import pytest
from pytest_mock import MockerFixture
from sqlalchemy import func
from sqlalchemy.orm import Session
from telethon.tl.types import ChatAdminRights

from community_manager.actions.chat import CommunityManagerChatAction
from core.dtos.pagination import PaginationMetadataDTO
from core.models.chat import TelegramChat, TelegramChatUser
from tests.factories.rule.group import TelegramChatRuleGroupFactory
from tests.utils.misc import AsyncIterator
from core.actions.chat import TelegramChatAction
from core.constants import (
    REQUIRED_BOT_PRIVILEGES,
    DEFAULT_MANAGED_USERS_PUBLIC_THRESHOLD,
)
from core.dtos.chat import (
    TelegramChatDTO,
    TelegramChatOrderingRuleDTO,
    TelegramChatPreviewDTO,
)
from core.exceptions.chat import TelegramChatNotSufficientPrivileges
from core.models.user import User
from tests.factories import TelegramChatUserFactory, TelegramChatFactory, UserFactory


BATCH_RECORDS_COUNT = 15


def test_get_all_managed_success(db_session: Session) -> None:
    """Test successful retrieval of all chats managed by a user using real database objects."""
    # Arrange - Create real objects in the database using factories
    user = UserFactory.with_session(db_session).create(is_admin=True)

    # Create multiple chats
    chat1, chat2, chat3 = TelegramChatFactory.with_session(db_session).create_batch(3)

    TelegramChatUserFactory.with_session(db_session).create(
        chat=chat1, user=user, is_admin=True
    )
    TelegramChatUserFactory.with_session(db_session).create(
        chat=chat2, user=user, is_admin=True
    )
    TelegramChatUserFactory.with_session(db_session).create(chat=chat3, user=user)

    # Act
    action = TelegramChatAction(db_session)
    result = action.get_all_managed(user)

    # Assert
    assert len(result) == 2
    assert all(isinstance(chat, TelegramChatDTO) for chat in result)
    assert {chat.id for chat in result} == {chat1.id, chat2.id}


def test_get_all__success(db_session: Session) -> None:
    """Test successful retrieval of all chats using real database objects."""
    # Arrange - Create real objects in the database using factories
    user = UserFactory.with_session(db_session).create(is_admin=False)

    # Create multiple chats
    chats = TelegramChatFactory.with_session(db_session).create_batch(3)
    # Assign user to one chat only to ensure it doesn't impact results
    TelegramChatUserFactory.with_session(db_session).create(
        chat=chats[1], user=user, is_admin=True
    )
    # For get_all it's mandatory that chat has at least one rule group to be treated as active
    for chat in chats:
        TelegramChatRuleGroupFactory.with_session(db_session).create(chat=chat)
        TelegramChatUserFactory.with_session(db_session).create_batch(
            DEFAULT_MANAGED_USERS_PUBLIC_THRESHOLD, chat=chat
        )
    # The default ordering is by users-count -> ID
    ordered_chats = (
        db_session.query(TelegramChat)
        .outerjoin(TelegramChatUser, TelegramChat.id == TelegramChatUser.chat_id)
        .group_by(TelegramChat.id)
        .order_by(func.count(TelegramChatUser.user_id).desc(), TelegramChat.id)
        .all()
    )

    # Act
    action = TelegramChatAction(db_session)
    result = action.get_all(
        pagination_params=PaginationMetadataDTO(
            offset=0, limit=100, include_total_count=True
        ),
        sorting_params=None,
    )

    # Assert
    assert len(result.items) == 3
    assert result.total_count == 3

    for expected_chat, actual_chat in zip(ordered_chats, result.items):
        assert isinstance(actual_chat, TelegramChatPreviewDTO)
        assert actual_chat.id == expected_chat.id
        assert actual_chat.title == expected_chat.title
        assert actual_chat.is_forum == expected_chat.is_forum
        assert actual_chat.members_count == len(expected_chat.users)


@pytest.mark.parametrize(
    ("offset", "limit", "expected_count", "include_total_count"),
    [
        (0, 1, 1, True),
        (1, 1, 1, True),
        (0, 10, 10, True),
        (1, 10, 10, True),
        # Should be aligned with a number of records created
        (0, 100, BATCH_RECORDS_COUNT, True),
        (0, 1, 1, False),
        (1, 1, 1, False),
    ],
)
def test_get_all__pagination__success(
    db_session: Session,
    offset: int,
    limit: int,
    expected_count: int,
    include_total_count: bool,
) -> None:
    """Test successful retrieval of all chats using real database objects and pagination."""
    # Arrange - Create real objects in the database using factories
    # Create multiple chats
    chats = TelegramChatFactory.with_session(db_session).create_batch(
        BATCH_RECORDS_COUNT
    )
    # For get_all it's mandatory that chat has at least one rule group to be treated as active
    for chat in chats:
        TelegramChatRuleGroupFactory.with_session(db_session).create(chat=chat)
        TelegramChatUserFactory.with_session(db_session).create_batch(
            DEFAULT_MANAGED_USERS_PUBLIC_THRESHOLD, chat=chat
        )

    ordered_chats = sorted(chats, key=lambda _chat: _chat.id)

    # Act
    action = TelegramChatAction(db_session)
    result = action.get_all(
        pagination_params=PaginationMetadataDTO(
            offset=offset, limit=limit, include_total_count=include_total_count
        ),
        sorting_params=None,
    )

    # Assert
    assert len(result.items) == expected_count
    if include_total_count:
        assert (
            result.total_count == BATCH_RECORDS_COUNT
        ), "Should be aligned with a number of records created"
    else:
        assert (
            result.total_count is None
        ), "Should be None if include_total_count is False"

    for expected_chat, actual_chat in zip(
        ordered_chats[offset : offset + limit], result.items
    ):
        assert isinstance(actual_chat, TelegramChatPreviewDTO)
        assert actual_chat.id == expected_chat.id
        assert actual_chat.title == expected_chat.title
        assert actual_chat.is_forum == expected_chat.is_forum
        assert actual_chat.members_count == len(expected_chat.users)


@pytest.mark.parametrize(
    "is_ascending",
    [True, False],
)
def test_get_all__sorting__success(db_session: Session, is_ascending: bool) -> None:
    """Test successful retrieval of all chats using real database objects."""
    # Arrange - Create real objects in the database using factories
    user = UserFactory.with_session(db_session).create(is_admin=False)

    # Create multiple chats
    chats = TelegramChatFactory.with_session(db_session).create_batch(3)
    # For get_all it's mandatory that chat has at least one rule group to be treated as active
    for _chat in chats:
        TelegramChatRuleGroupFactory.with_session(db_session).create(chat=_chat)
        TelegramChatUserFactory.with_session(db_session).create_batch(
            DEFAULT_MANAGED_USERS_PUBLIC_THRESHOLD, chat=_chat
        )

    # Assign user to one chat only to ensure it doesn't impact results
    TelegramChatUserFactory.with_session(db_session).create(
        chat=chats[0], user=user, is_admin=True
    )
    ordered_chats = sorted(
        chats, key=lambda chat: (chat.title, chat.id), reverse=not is_ascending
    )

    # Act
    action = TelegramChatAction(db_session)
    result = action.get_all(
        pagination_params=PaginationMetadataDTO(
            offset=0, limit=100, include_total_count=True
        ),
        sorting_params=TelegramChatOrderingRuleDTO(
            field="title", is_ascending=is_ascending
        ),
    )

    # Assert
    assert len(result.items) == 3
    assert result.total_count == 3

    for expected_chat, actual_chat in zip(ordered_chats, result.items):
        assert isinstance(actual_chat, TelegramChatPreviewDTO)
        assert actual_chat.id == expected_chat.id
        assert actual_chat.title == expected_chat.title
        assert actual_chat.is_forum == expected_chat.is_forum
        assert actual_chat.members_count == len(expected_chat.users)


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("admin_rights", "should_raise"),
    [
        ({right: True for right in REQUIRED_BOT_PRIVILEGES}, False),
        ({right: False for right in REQUIRED_BOT_PRIVILEGES}, True),
    ],
)
async def test_get_chat_data_success(
    db_session: Session,
    mocked_telethon_client: MagicMock,
    mocked_telethon_chat: MagicMock,
    mocker: MockerFixture,
    admin_rights: dict[str, bool],
    should_raise: bool,
) -> None:
    mocked_telethon_chat.admin_rights = mocker.create_autospec(
        ChatAdminRights, **admin_rights
    )
    mocked_telethon_client.get_entity = mocker.AsyncMock(
        return_value=mocked_telethon_chat
    )

    # Act: Call `_get_chat_data`
    action = CommunityManagerChatAction(
        db_session, telethon_client=mocked_telethon_client
    )

    if should_raise:
        with pytest.raises(TelegramChatNotSufficientPrivileges):
            await action._get_chat_data(mocked_telethon_chat.id)
    else:
        result = await action._get_chat_data(mocked_telethon_chat.id)
        assert result.id == mocked_telethon_chat.id
        assert result.title == mocked_telethon_chat.title
        assert result.admin_rights == mocked_telethon_chat.admin_rights

    # Assert: Check if the mock methods were called and data was retrieved correctly
    mocked_telethon_client.get_entity.assert_called_once_with(mocked_telethon_chat.id)


@pytest.mark.asyncio
async def test_load_participants(
    db_session: Session,
    mocked_telethon_client: MagicMock,
    mocked_telethon_user: MagicMock,
    mocker: MockerFixture,
) -> None:
    # Arrange: Create a chat in the database
    chat = TelegramChatFactory.with_session(db_session).create()

    mocked_telethon_client.iter_participants = mocker.Mock(
        return_value=AsyncIterator([mocked_telethon_user])
    )

    # Act: Call `_load_participants`
    action = CommunityManagerChatAction(
        db_session, telethon_client=mocked_telethon_client
    )
    await action._load_participants(chat.id)

    # Assert: Verify the participant was added to the database
    user = (
        db_session.query(User).filter(User.telegram_id == mocked_telethon_user.id).one()
    )
    assert user.username == mocked_telethon_user.username


@pytest.mark.parametrize("sufficient_bot_privileges", [True, False])
@pytest.mark.asyncio
async def test_create_success(
    db_session: Session,
    mocked_telethon_chat_sufficient_rights: MagicMock,
    mocked_telethon_client: MagicMock,
    mocker: MockerFixture,
    sufficient_bot_privileges: bool,
):
    """Test successful creation of a Telegram chat."""
    # Arrange
    chat_identifier = -123456789
    chat_invite_link = "https://t.me/joinchat/123456789"
    mocked_telethon_chat_sufficient_rights.id = chat_identifier

    # Mock get_peer_id to return the chat_id
    mocker.patch("telethon.utils.get_peer_id", return_value=chat_identifier)

    mocked_telethon_client.get_entity = AsyncMock(
        return_value=mocked_telethon_chat_sufficient_rights
    )

    # Mock fetch_and_push_profile_photo to return None (no profile photo)
    mock_fetch_photo = AsyncMock(return_value=None)
    mocker.patch.object(
        CommunityManagerChatAction, "fetch_and_push_profile_photo", mock_fetch_photo
    )

    # Act
    action = CommunityManagerChatAction(
        db_session, telethon_client=mocked_telethon_client
    )
    action.telethon_service.get_invite_link = AsyncMock(
        return_value=MagicMock(link=chat_invite_link)
    )
    event = Mock()
    event.is_self = True
    event.sufficient_bot_privileges = sufficient_bot_privileges
    result = await action.create(chat_identifier, event=event)
    # Verify that the chat was created in the database
    assert isinstance(result, TelegramChatDTO)
    assert result.id == mocked_telethon_chat_sufficient_rights.id
    assert result.title == mocked_telethon_chat_sufficient_rights.title
    assert result.is_forum == mocked_telethon_chat_sufficient_rights.forum
    assert result.insufficient_privileges != sufficient_bot_privileges
    # We don't provide any mocked participants
    assert result.members_count == 0
