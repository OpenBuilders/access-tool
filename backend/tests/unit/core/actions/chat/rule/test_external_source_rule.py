from typing import Any
from unittest.mock import AsyncMock

import pytest
import respx
from sqlalchemy.orm import Session

from core.actions.chat.rule.whitelist import TelegramChatWhitelistExternalSourceAction
from core.dtos.chat.rule.whitelist import (
    WhitelistRuleExternalDTO,
    TelegramChatWhitelistExternalSourceDTO,
    WhitelistRuleItemsDifferenceDTO,
)
from core.exceptions.chat import TelegramChatInvalidExternalSourceError
from core.models.rule import TelegramChatWhitelistExternalSource
from tests.factories import TelegramChatFactory, UserFactory
from tests.factories.rule.external_source import (
    TelegramChatWhitelistExternalSourceFactory,
)
from tests.factories.rule.group import TelegramChatRuleGroupFactory
from tests.fixtures.action import ChatManageActionFactory


@pytest.mark.asyncio
async def test_create_external_source_rule__pass(
    db_session: Session,
    mocked_managed_chat_action_factory: ChatManageActionFactory,
):
    chat = TelegramChatFactory.with_session(db_session).create()
    group = TelegramChatRuleGroupFactory.with_session(db_session).create(chat=chat)

    requestor = UserFactory.with_session(db_session).create()

    action = mocked_managed_chat_action_factory(
        action_cls=TelegramChatWhitelistExternalSourceAction,
        db_session=db_session,
        chat_slug=chat.slug,
        requestor=requestor,
    )
    new_content = [1234, 2345]
    action.telegram_chat_external_source_service.validate_external_source = AsyncMock(
        return_value=WhitelistRuleItemsDifferenceDTO(
            previous=None,
            current=new_content,
        )
    )
    assert db_session.query(TelegramChatWhitelistExternalSource).first() is None, (
        "There is already an existing rule."
    )
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
    assert existing_rule.content == new_content


@pytest.mark.asyncio
@respx.mock
@pytest.mark.parametrize(
    ("status_code", "response"),
    [
        (404, {"error": "Not Found"}),
        (500, {"error": "Internal Server Error"}),
        (200, {"status": "ok"}),
        (200, {"users": ["asdv"]}),
    ],
)
async def test_create_external_source_rule__fails_validation__doesnt_create(
    db_session: Session,
    mocked_managed_chat_action_factory: ChatManageActionFactory,
    status_code: int,
    response: dict[str, Any],
):
    chat = TelegramChatFactory.with_session(db_session).create()
    group = TelegramChatRuleGroupFactory.with_session(db_session).create(chat=chat)

    requestor = UserFactory.with_session(db_session).create()
    action = mocked_managed_chat_action_factory(
        action_cls=TelegramChatWhitelistExternalSourceAction,
        db_session=db_session,
        chat_slug=chat.slug,
        requestor=requestor,
    )

    input_dto = TelegramChatWhitelistExternalSourceDTO(
        url="https://notco.in/metadata",
        name="New External Source",
        description="Some description",
        auth_key="Some auth key",
        auth_value="Some value",
        is_enabled=True,
    )

    respx.get("https://notco.in/metadata").respond(
        status_code=status_code,
        json=response,
    )
    with pytest.raises(TelegramChatInvalidExternalSourceError):
        await action.create(
            group_id=group.id, **input_dto.model_dump(exclude={"is_enabled"})
        )
    assert db_session.query(TelegramChatWhitelistExternalSource).first() is None, (
        "The rule should not be created."
    )


@pytest.mark.asyncio
async def test_update_external_source_rule__pass(
    db_session: Session,
    mocked_managed_chat_action_factory: ChatManageActionFactory,
) -> None:
    telegram_chat = TelegramChatFactory.with_session(db_session).create()
    requestor = UserFactory.with_session(db_session).create()
    telegram_chat_external_source_rule = (
        TelegramChatWhitelistExternalSourceFactory.with_session(db_session).create(
            chat=telegram_chat
        )
    )
    new_input_dto = TelegramChatWhitelistExternalSourceDTO(
        url="https://notco.in/metadata",
        name="New External Source",
        description="Some description",
        auth_key="Some auth key",
        auth_value="Some value",
        is_enabled=True,
    )

    action = mocked_managed_chat_action_factory(
        action_cls=TelegramChatWhitelistExternalSourceAction,
        db_session=db_session,
        chat_slug=telegram_chat_external_source_rule.chat.slug,
        requestor=requestor,
    )
    old_content = telegram_chat_external_source_rule.content
    new_content = [1234, 2345]
    action.telegram_chat_external_source_service.validate_external_source = AsyncMock(
        return_value=WhitelistRuleItemsDifferenceDTO(
            previous=old_content,
            current=new_content,
        )
    )

    await action.update(
        rule_id=telegram_chat_external_source_rule.id,
        **new_input_dto.model_dump(),
    )

    existing_rule = db_session.query(TelegramChatWhitelistExternalSource).one()
    assert existing_rule.id == telegram_chat_external_source_rule.id
    assert existing_rule.url == new_input_dto.url
    assert existing_rule.name == new_input_dto.name
    assert existing_rule.description == new_input_dto.description
    assert existing_rule.is_enabled == new_input_dto.is_enabled
    assert existing_rule.content == old_content, "The content should not be updated."
    assert existing_rule.content != new_content
