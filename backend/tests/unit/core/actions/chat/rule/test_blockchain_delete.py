import pytest
from sqlalchemy.orm import Session

from core.actions.chat.base import ManagedChatBaseAction
from core.actions.chat.rule.blockchain import (
    TelegramChatJettonAction,
    TelegramChatNFTCollectionAction,
    TelegramChatToncoinAction,
)
from core.models.rule import (
    TelegramChatJetton,
    TelegramChatNFTCollection,
    TelegramChatToncoin,
    TelegramChatRuleGroup,
    TelegramChatRuleBase,
)
from tests.factories.rule.base import TelegramChatRuleBaseFactory
from tests.factories.rule.group import TelegramChatRuleGroupFactory
from tests.factories.rule.blockchain import (
    TelegramChatJettonRuleFactory,
    TelegramChatNFTCollectionRuleFactory,
    TelegramChatToncoinRuleFactory,
)
from tests.factories import UserFactory
from tests.fixtures.action import ChatManageActionFactory


@pytest.mark.parametrize(
    ("action_cls", "factory_cls", "model_cls"),
    [
        (TelegramChatJettonAction, TelegramChatJettonRuleFactory, TelegramChatJetton),
        (
            TelegramChatNFTCollectionAction,
            TelegramChatNFTCollectionRuleFactory,
            TelegramChatNFTCollection,
        ),
        (
            TelegramChatToncoinAction,
            TelegramChatToncoinRuleFactory,
            TelegramChatToncoin,
        ),
    ],
)
@pytest.mark.asyncio
async def test_delete_rule__last_in_group__group_removed(
    db_session: Session,
    mocked_managed_chat_action_factory: ChatManageActionFactory,
    action_cls: type[ManagedChatBaseAction],
    factory_cls: type[TelegramChatRuleBaseFactory],
    model_cls: type[TelegramChatRuleBase],
) -> None:
    group = TelegramChatRuleGroupFactory.with_session(db_session).create()
    rule = factory_cls.with_session(db_session).create(group=group, chat=group.chat)
    requestor = UserFactory.with_session(db_session).create()

    action = mocked_managed_chat_action_factory(
        action_cls=action_cls,
        db_session=db_session,
        chat_slug=rule.chat.slug,
        requestor=requestor,
    )

    action.delete(rule_id=rule.id)

    assert db_session.query(model_cls).first() is None, "The rule should be deleted."
    assert (
        db_session.query(TelegramChatRuleGroup).filter_by(id=group.id).first() is None
    ), "The group should be deleted."


@pytest.mark.parametrize(
    ("action_cls", "factory_cls", "model_cls"),
    [
        (TelegramChatJettonAction, TelegramChatJettonRuleFactory, TelegramChatJetton),
        (
            TelegramChatNFTCollectionAction,
            TelegramChatNFTCollectionRuleFactory,
            TelegramChatNFTCollection,
        ),
        (
            TelegramChatToncoinAction,
            TelegramChatToncoinRuleFactory,
            TelegramChatToncoin,
        ),
    ],
)
@pytest.mark.asyncio
async def test_delete_rule__other_rules_exist__group_retained(
    db_session: Session,
    mocked_managed_chat_action_factory: ChatManageActionFactory,
    action_cls: type[ManagedChatBaseAction],
    factory_cls: type[TelegramChatRuleBaseFactory],
    model_cls: type[TelegramChatRuleBase],
) -> None:
    group = TelegramChatRuleGroupFactory.with_session(db_session).create()
    group_id = (
        group.id
    )  # Store ID to avoid accessing stale object after commit/rollback
    rule_to_delete = factory_cls.with_session(db_session).create(
        group=group, chat=group.chat
    )
    rule_to_delete_id = rule_to_delete.id
    # Create another rule in the same group
    factory_cls.with_session(db_session).create(group=group, chat=group.chat)

    requestor = UserFactory.with_session(db_session).create()

    action = mocked_managed_chat_action_factory(
        action_cls=action_cls,
        db_session=db_session,
        chat_slug=group.chat.slug,
        requestor=requestor,
    )

    action.delete(rule_id=rule_to_delete_id)

    assert (
        db_session.query(model_cls).filter_by(id=rule_to_delete_id).first() is None
    ), "The specific rule should be deleted."
    assert (
        db_session.query(TelegramChatRuleGroup).filter_by(id=group_id).first()
        is not None
    ), "The group should NOT be deleted."
    assert db_session.query(model_cls).count() == 1, "One rule should remain."
