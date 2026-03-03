import pytest
import logging
from unittest.mock import AsyncMock, MagicMock, patch

from community_manager.actions.chat import CommunityManagerUserChatAction
from core.dtos.chat.rule.internal import (
    ChatMemberEligibilityResultDTO,
    EligibilitySummaryInternalDTO,
    RulesEligibilityGroupSummaryInternalDTO,
    RulesEligibilitySummaryInternalDTO,
)
from core.enums.rule import EligibilityCheckType
from tests.factories import TelegramChatFactory, TelegramChatUserFactory, UserFactory


@pytest.mark.asyncio
async def test_kick_chat_member_admin_protection(db_session):
    action = CommunityManagerUserChatAction(db_session)
    chat = TelegramChatFactory.with_session(db_session).create(
        id=1, title="Test Chat", is_full_control=True
    )
    user = UserFactory.with_session(db_session).create(id=1, telegram_id=123)
    chat_user = TelegramChatUserFactory.with_session(db_session).create(
        user=user, chat=chat, is_admin=True, is_managed=True
    )

    # Mock bot_api_service to ensure it is NOT called
    action.bot_api_service = AsyncMock()

    await action.kick_chat_member(chat_user)

    action.bot_api_service.kick_chat_member.assert_not_called()


@pytest.mark.asyncio
async def test_kick_chat_member_normal_user(db_session):
    action = CommunityManagerUserChatAction(db_session)
    chat = TelegramChatFactory.with_session(db_session).create(
        id=1, title="Test Chat", is_full_control=True
    )
    user = UserFactory.with_session(db_session).create(id=1, telegram_id=123)
    chat_user = TelegramChatUserFactory.with_session(db_session).create(
        user=user, chat=chat, is_admin=False, is_managed=True
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
    chat = TelegramChatFactory.with_session(db_session).create(
        id=1, title="Test Chat", is_full_control=True
    )

    # Create 3 users:
    # 1. Managed and ineligible
    # 2. Non-managed and ineligible
    # 3. Non-managed and eligible (to test total non_managed counting)
    user1 = UserFactory.with_session(db_session).create(id=1, telegram_id=111)
    chat_user1 = TelegramChatUserFactory.with_session(db_session).create(
        user=user1, chat=chat, is_admin=False, is_managed=True
    )

    user2 = UserFactory.with_session(db_session).create(id=2, telegram_id=222)
    chat_user2 = TelegramChatUserFactory.with_session(db_session).create(
        user=user2, chat=chat, is_admin=False, is_managed=False
    )

    user3 = UserFactory.with_session(db_session).create(id=3, telegram_id=333)
    chat_user3 = TelegramChatUserFactory.with_session(db_session).create(
        user=user3, chat=chat, is_admin=False, is_managed=False
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
        summary=RulesEligibilitySummaryInternalDTO(
            groups=[
                RulesEligibilityGroupSummaryInternalDTO(
                    id=1,
                    items=[
                        EligibilitySummaryInternalDTO(
                            id=1,
                            group_id=1,
                            type=EligibilityCheckType.TONCOIN,
                            title="TON",
                            actual=0.5,
                            expected=1.0,
                            is_enabled=True,
                        )
                    ],
                )
            ],
            wallet="EQD123",
        ),
    )
    res2 = ChatMemberEligibilityResultDTO(
        member=chat_user2,
        is_eligible=False,
        summary=RulesEligibilitySummaryInternalDTO(
            groups=[
                RulesEligibilityGroupSummaryInternalDTO(
                    id=2,
                    items=[
                        EligibilitySummaryInternalDTO(
                            id=2,
                            group_id=2,
                            type=EligibilityCheckType.JETTON,
                            title="USDT",
                            actual=0,
                            expected=100,
                            is_enabled=True,
                        )
                    ],
                )
            ],
            wallet=None,
        ),
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

    assert (
        'User 111 is ineligible for chat 1. Managed: True. Compliance summary: {"groups":[{"id":1,"items":[{"id":1,"group_id":1,"type":"toncoin","title":"TON","address_raw":null,"actual":0.5,"expected":1.0,"is_enabled":true,"category":null,"is_eligible":false}]}],"wallet":"EQD123"}'
        in caplog.text
    )
    assert (
        'User 222 is ineligible for chat 1. Managed: False. Compliance summary: {"groups":[{"id":2,"items":[{"id":2,"group_id":2,"type":"jetton","title":"USDT","address_raw":null,"actual":0,"expected":100,"is_enabled":true,"category":null,"is_eligible":false}]}],"wallet":null}'
        in caplog.text
    )


@pytest.mark.asyncio
async def test_kick_ineligible_chat_members_sets_managed_flag(db_session):
    action = CommunityManagerUserChatAction(db_session)
    chat = TelegramChatFactory.with_session(db_session).create(
        id=1, title="Test Chat", is_full_control=True
    )

    user1 = UserFactory.with_session(db_session).create(id=1, telegram_id=111)
    chat_user1 = TelegramChatUserFactory.with_session(db_session).create(
        user=user1, chat=chat, is_admin=False, is_managed=False
    )

    action.authorization_action = MagicMock()

    res1 = ChatMemberEligibilityResultDTO(
        member=chat_user1,
        is_eligible=True,
        summary=RulesEligibilitySummaryInternalDTO(groups=[]),
    )
    action.authorization_action.evaluate_chat_members_eligibility.return_value = [res1]

    assert chat_user1.is_managed is False

    await action.kick_ineligible_chat_members([chat_user1])

    assert chat_user1.is_managed is True
