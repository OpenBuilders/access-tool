import pytest
import logging
from unittest.mock import AsyncMock, MagicMock, patch

from community_manager.actions.chat import CommunityManagerUserChatAction
from core.models.chat import TelegramChatUser, TelegramChat
from core.models.user import User
from core.dtos.chat.rule.internal import (
    ChatMemberEligibilityResultDTO,
    RulesEligibilitySummaryInternalDTO,
)


@pytest.mark.asyncio
async def test_kick_chat_member_admin_protection(db_session):
    action = CommunityManagerUserChatAction(db_session)
    chat = TelegramChat(id=1, title="Test Chat", is_full_control=True)
    user = User(id=1, telegram_id=123)
    chat_user = TelegramChatUser(
        user_id=1, chat_id=1, is_admin=True, is_managed=True, chat=chat, user=user
    )

    # Mock bot_api_service to ensure it is NOT called
    action.bot_api_service = AsyncMock()

    await action.kick_chat_member(chat_user)

    action.bot_api_service.kick_chat_member.assert_not_called()


@pytest.mark.asyncio
async def test_kick_chat_member_normal_user(db_session):
    action = CommunityManagerUserChatAction(db_session)
    chat = TelegramChat(id=1, title="Test Chat", is_full_control=True)
    user = User(id=1, telegram_id=123)
    chat_user = TelegramChatUser(
        user_id=1, chat_id=1, is_admin=False, is_managed=True, chat=chat, user=user
    )

    # Mock bot_api_service context manager
    # We need to mock the class instantiated in the method: TelegramBotApiService
    with patch("community_manager.actions.chat.TelegramBotApiService") as MockService:
        mock_service_instance = AsyncMock()
        MockService.return_value.__aenter__.return_value = mock_service_instance

        # Mock delete
        # telegram_chat_user_service is synchronous
        action.telegram_chat_user_service = MagicMock()

        await action.kick_chat_member(chat_user)

        mock_service_instance.kick_chat_member.assert_awaited_once()


@pytest.mark.asyncio
async def test_check_chat_members_compliance_dry_run_counters(db_session, caplog):
    action = CommunityManagerUserChatAction(db_session)
    chat = TelegramChat(id=1, title="Test Chat", is_full_control=True)

    # Create 3 users:
    # 1. Managed and ineligible
    # 2. Non-managed and ineligible
    # 3. Non-managed and eligible (to test total non_managed counting)
    user1 = User(id=1, telegram_id=111)
    chat_user1 = TelegramChatUser(
        user_id=1, chat_id=1, is_admin=False, is_managed=True, chat=chat, user=user1
    )

    user2 = User(id=2, telegram_id=222)
    chat_user2 = TelegramChatUser(
        user_id=2, chat_id=1, is_admin=False, is_managed=False, chat=chat, user=user2
    )

    user3 = User(id=3, telegram_id=333)
    chat_user3 = TelegramChatUser(
        user_id=3, chat_id=1, is_admin=False, is_managed=False, chat=chat, user=user3
    )

    # Mock telegram_chat_user_service yield
    action.telegram_chat_user_service = MagicMock()
    action.telegram_chat_user_service.yield_all_for_chat.return_value = [
        [chat_user1, chat_user2, chat_user3]
    ]

    # Mock evaluate_chat_members_eligibility
    action.authorization_action = MagicMock()

    res1 = ChatMemberEligibilityResultDTO(
        member=chat_user1,
        is_eligible=False,
        summary=RulesEligibilitySummaryInternalDTO(groups=[]),
    )
    res2 = ChatMemberEligibilityResultDTO(
        member=chat_user2,
        is_eligible=False,
        summary=RulesEligibilitySummaryInternalDTO(groups=[]),
    )
    res3 = ChatMemberEligibilityResultDTO(
        member=chat_user3,
        is_eligible=True,
        summary=RulesEligibilitySummaryInternalDTO(groups=[]),
    )

    action.authorization_action.evaluate_chat_members_eligibility.return_value = [
        res1,
        res2,
        res3,
    ]

    with caplog.at_level(logging.INFO):
        await action.check_chat_members_compliance_dry_run(chat_id=1)

    # Check that counts were correctly logged
    # Total processed: 3, Non-managed: 2, Ineligible (managed): 1, Ineligible (non-managed): 1
    assert "Total processed: 3" in caplog.text
    assert "Non-managed: 2" in caplog.text
    assert "Ineligible (managed): 1" in caplog.text
    assert "Ineligible (non-managed): 1" in caplog.text

    assert "User 111 is ineligible for chat 1. Managed: True" in caplog.text
    assert "User 222 is ineligible for chat 1. Managed: False" in caplog.text
