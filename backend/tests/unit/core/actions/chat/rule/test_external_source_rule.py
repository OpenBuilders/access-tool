from unittest.mock import AsyncMock

import pytest
from sqlalchemy.orm import Session

from core.actions.chat.rule.whitelist import TelegramChatWhitelistExternalSourceAction
from core.dtos.chat.rule.whitelist import (
    WhitelistRuleExternalDTO,
    TelegramChatWhitelistExternalSourceDTO,
)
from core.models.rule import TelegramChatWhitelistExternalSource
from tests.factories import TelegramChatFactory, UserFactory
from tests.factories.rule.group import TelegramChatRuleGroupFactory
from tests.fixtures.action import ChatManageActionFactory


@pytest.mark.asyncio
async def test_create_external_source_rule__pass(
    db_session: Session,
    mocked_managed_chat_action_factory: ChatManageActionFactory,
):
    chat = TelegramChatFactory.create()
    group = TelegramChatRuleGroupFactory.create(chat=chat)

    requestor = UserFactory.create()

    action = mocked_managed_chat_action_factory(
        action_cls=TelegramChatWhitelistExternalSourceAction,
        db_session=db_session,
        chat_slug=chat.slug,
        requestor=requestor,
    )
    action.content_action.refresh_external_source = AsyncMock()
    assert (
        db_session.query(TelegramChatWhitelistExternalSource).first() is None
    ), "There is already an existing rule."
    input_dto = TelegramChatWhitelistExternalSourceDTO(
        url="https://notco.in/metadata",
        name="New External Source",
        description="Some description",
        auth_key="Some auth key",
        auth_value="Some value",
        is_enabled=True,
    )

    result = await action.create(
        group_id=group.id, **input_dto.model_dump(exclude={"is_enabled"})
    )
    assert isinstance(result, WhitelistRuleExternalDTO)

    existing_rule = db_session.query(TelegramChatWhitelistExternalSource).one()
    assert existing_rule.group_id == group.id
    assert existing_rule.url == input_dto.url
    assert existing_rule.name == input_dto.name
    assert existing_rule.description == input_dto.description
    assert existing_rule.is_enabled == input_dto.is_enabled
