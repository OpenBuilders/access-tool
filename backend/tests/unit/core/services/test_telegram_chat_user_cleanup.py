from sqlalchemy.orm import Session
from core.services.chat.user import TelegramChatUserService
from tests.factories import TelegramChatFactory, TelegramChatUserFactory, UserFactory


def test_delete_stale_participants(db_session: Session) -> None:
    # Arrange
    chat = TelegramChatFactory.with_session(db_session).create()
    users = UserFactory.with_session(db_session).create_batch(5)

    # Add 5 users to the chat
    for user in users:
        TelegramChatUserFactory.with_session(db_session).create(chat=chat, user=user)

    service = TelegramChatUserService(db_session)
    assert service.get_members_count(chat.id) == 5

    # Act: Clean up stale participants, keeping only user 0, 2, and 4
    active_user_ids = [users[0].id, users[2].id, users[4].id]
    service.delete_stale_participants(chat_id=chat.id, active_user_ids=active_user_ids)

    # Assert
    assert service.get_members_count(chat.id) == 3
    remaining_user_ids = {cu.user_id for cu in service.get_all(chat_ids=[chat.id])}
    assert remaining_user_ids == set(active_user_ids)

    # Check that users 1 and 3 were removed
    assert users[1].id not in remaining_user_ids
    assert users[3].id not in remaining_user_ids
