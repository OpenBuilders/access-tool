import pytest
from unittest.mock import AsyncMock, patch

from sqlalchemy.orm import Session

from community_manager.actions.chat import (
    CommunityManagerTaskChatAction,
    CommunityManagerUserChatAction,
)
from core.dtos.chat.rule.whitelist import WhitelistRuleItemsDifferenceDTO
from core.services.chat.rule.whitelist import TelegramChatExternalSourceService
from tests.factories.chat import TelegramChatFactory, TelegramChatUserFactory
from tests.factories.rule.external_source import (
    TelegramChatWhitelistExternalSourceFactory,
)
from tests.factories.rule.group import TelegramChatRuleGroupFactory
from tests.factories.user import UserFactory


@pytest.mark.asyncio
async def test_refresh_external_sources__removed_user_is_kicked(
    db_session: Session,
):
    chat = TelegramChatFactory.create(is_full_control=True)
    group = TelegramChatRuleGroupFactory.create(chat=chat)

    user_stays = UserFactory.create(telegram_id=1001)
    user_removed = UserFactory.create(telegram_id=1002)

    TelegramChatUserFactory.create(chat=chat, user=user_stays, is_managed=True)
    TelegramChatUserFactory.create(chat=chat, user=user_removed, is_managed=True)

    source = TelegramChatWhitelistExternalSourceFactory.create(
        chat=chat,
        group=group,
        content=[1001, 1002],
        is_enabled=True,
        url="https://example.com/api/whitelist",
    )
    db_session.flush()

    mock_validate = AsyncMock(
        return_value=WhitelistRuleItemsDifferenceDTO(
            previous=[1001, 1002],
            current=[1001],
        )
    )

    action = CommunityManagerTaskChatAction(db_session)

    with patch.object(
        TelegramChatExternalSourceService,
        "validate_external_source",
        mock_validate,
    ), patch.object(
        CommunityManagerUserChatAction,
        "kick_chat_member",
        new_callable=AsyncMock,
    ) as mock_kick:
        await action.refresh_external_sources()

        # User 1002 was removed from the API response and should be kicked
        mock_kick.assert_awaited_once()
        kicked_member = mock_kick.await_args.args[0]
        assert kicked_member.user.telegram_id == 1002
        assert kicked_member.chat_id == chat.id

    db_session.refresh(source)
    assert source.content == [1001]


@pytest.mark.asyncio
async def test_refresh_external_sources__no_removed_users__no_kicks(
    db_session: Session,
):
    chat = TelegramChatFactory.create(is_full_control=True)
    group = TelegramChatRuleGroupFactory.create(chat=chat)

    user = UserFactory.create(telegram_id=1001)
    TelegramChatUserFactory.create(chat=chat, user=user, is_managed=True)

    TelegramChatWhitelistExternalSourceFactory.create(
        chat=chat,
        group=group,
        content=[1001],
        is_enabled=True,
        url="https://example.com/api/whitelist",
    )
    db_session.flush()

    mock_validate = AsyncMock(
        return_value=WhitelistRuleItemsDifferenceDTO(
            previous=[1001],
            current=[1001],
        )
    )

    action = CommunityManagerTaskChatAction(db_session)

    with patch.object(
        TelegramChatExternalSourceService,
        "validate_external_source",
        mock_validate,
    ), patch.object(
        CommunityManagerUserChatAction,
        "kick_chat_member",
        new_callable=AsyncMock,
    ) as mock_kick:
        await action.refresh_external_sources()

        mock_kick.assert_not_awaited()
