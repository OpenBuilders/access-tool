import pytest
from sqlalchemy.orm import Session

from core.actions.chat.rule import RuleAction
from core.dtos.chat.rule import UpdateRuleGroupDTO
from core.enums.rule import EligibilityCheckType
from core.models.rule import (
    TelegramChatStickerCollection,
    TelegramChatPremium,
    TelegramChatEmoji,
)
from tests.factories import UserFactory
from tests.factories.rule.emoji import TelegramChatEmojiRuleFactory
from tests.factories.rule.group import TelegramChatRuleGroupFactory
from tests.factories.rule.premium import TelegramChatPremiumFactory
from tests.factories.rule.sticker import TelegramChatStickerCollectionFactory
from tests.factories.rule.base import TelegramChatRuleBaseFactory
from tests.fixtures.action import ChatManageActionFactory


@pytest.mark.parametrize(
    ("factory_cls", "model", "rule_type"),
    [
        (
            TelegramChatStickerCollectionFactory,
            TelegramChatStickerCollection,
            EligibilityCheckType.STICKER_COLLECTION,
        ),
        (TelegramChatPremiumFactory, TelegramChatPremium, EligibilityCheckType.PREMIUM),
        (TelegramChatEmojiRuleFactory, TelegramChatEmoji, EligibilityCheckType.EMOJI),
    ],
)
@pytest.mark.asyncio
async def test_move_rule__pass(
    db_session: Session,
    mocked_managed_chat_action_factory: ChatManageActionFactory,
    factory_cls: type[TelegramChatRuleBaseFactory],
    model: type[TelegramChatStickerCollection],
    rule_type: EligibilityCheckType,
) -> None:
    initial_group = TelegramChatRuleGroupFactory.create()
    rules = factory_cls.with_session(db_session).create_batch(
        size=3, group=initial_group
    )
    target_rule = rules[0]

    requestor = UserFactory.create()
    another_group = TelegramChatRuleGroupFactory.create()

    assert initial_group.id != another_group.id, "The groups should be different."

    action = mocked_managed_chat_action_factory(
        action_cls=RuleAction,
        db_session=db_session,
        chat_slug=target_rule.chat.slug,
        requestor=requestor,
    )

    existing_rules = db_session.query(model).all()
    for rule in existing_rules:
        assert (
            rule.group_id == target_rule.group_id
        ), "All rules should be in the same group."

    action.move(
        item=UpdateRuleGroupDTO(
            rule_id=target_rule.id,
            type=rule_type,
            group_id=another_group.id,
            order=0,
        )
    )
    db_session.commit()

    updated_rule = db_session.query(model).all()
    for rule in updated_rule:
        assert rule.group_id == (
            another_group.id if rule.id == target_rule.id else initial_group.id
        ), "The rule should be moved to the new group."
