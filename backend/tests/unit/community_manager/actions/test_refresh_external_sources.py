import pytest
from unittest.mock import AsyncMock, patch

from sqlalchemy.orm import Session

from community_manager.actions.chat import (
    CommunityManagerTaskChatAction,
    CommunityManagerUserChatAction,
)
from core.actions.authorization import AuthorizationAction
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
        assert mock_kick.call_count == 1
        kicked_member = mock_kick.call_args.args[0]
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

        assert mock_kick.call_count == 0


@pytest.mark.asyncio
async def test_refresh_external_sources__only_target_chat_affected(
    db_session: Session,
):
    """
    When a user is removed from Chat A's external source, only Chat A membership
    should be evaluated — not memberships in other chats.
    """
    chat_a = TelegramChatFactory.create(is_full_control=True)
    chat_b = TelegramChatFactory.create(is_full_control=True)
    group_a = TelegramChatRuleGroupFactory.create(chat=chat_a)

    user = UserFactory.create(telegram_id=3001)

    TelegramChatUserFactory.create(chat=chat_a, user=user, is_managed=True)
    TelegramChatUserFactory.create(chat=chat_b, user=user, is_managed=True)

    TelegramChatWhitelistExternalSourceFactory.create(
        chat=chat_a,
        group=group_a,
        content=[3001],
        is_enabled=True,
        url="https://example.com/api/a",
    )
    db_session.flush()

    mock_validate = AsyncMock(
        return_value=WhitelistRuleItemsDifferenceDTO(
            previous=[3001],
            current=[],
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

        kicked_chat_ids = [
            call.args[0].chat_id
            for call in mock_kick.call_args_list
        ]

        # Only Chat A should be affected
        assert chat_b.id not in kicked_chat_ids


@pytest.mark.asyncio
async def test_refresh_external_sources__content_updated_before_kick(
    db_session: Session,
):
    """
    set_content must run before kick_ineligible_chat_members so that
    is_whitelisted reads the current list during the eligibility check.
    """
    chat = TelegramChatFactory.create(is_full_control=True)
    group = TelegramChatRuleGroupFactory.create(chat=chat)

    user = UserFactory.create(telegram_id=4001)
    TelegramChatUserFactory.create(chat=chat, user=user, is_managed=True)

    source = TelegramChatWhitelistExternalSourceFactory.create(
        chat=chat,
        group=group,
        content=[4001],
        is_enabled=True,
        url="https://example.com/api/whitelist",
    )
    db_session.flush()

    mock_validate = AsyncMock(
        return_value=WhitelistRuleItemsDifferenceDTO(
            previous=[4001],
            current=[],
        )
    )

    action = CommunityManagerTaskChatAction(db_session)

    with patch.object(
        TelegramChatExternalSourceService,
        "validate_external_source",
        mock_validate,
    ):
        # Verify that content is updated before eligibility check reads it
        auth_action = AuthorizationAction(db_session)

        original_get_ineligible = auth_action.get_ineligible_chat_members

        def assert_content_updated_before_check(chat_members):
            # At this point, set_content should have already run
            db_session.refresh(source)
            assert 4001 not in (source.content or []), (
                "set_content must run before get_ineligible_chat_members"
            )
            return original_get_ineligible(chat_members=chat_members)

        with patch.object(
            AuthorizationAction,
            "get_ineligible_chat_members",
            side_effect=assert_content_updated_before_check,
        ):
            await action.refresh_external_sources()
