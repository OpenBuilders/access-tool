from core.services.user import UserService
from tests.factories.user import UserFactory


def test_get_all_writable_telegram_ids(db_session):
    user_service = UserService(db_session)

    # Create some users with and without telegram_ids and allows_write_to_pm
    UserFactory.with_session(db_session).create(
        telegram_id=10001, allows_write_to_pm=True
    )
    UserFactory.with_session(db_session).create(
        telegram_id=10002, allows_write_to_pm=True
    )
    UserFactory.with_session(db_session).create(
        telegram_id=10003, allows_write_to_pm=False
    )
    UserFactory.with_session(db_session).create(
        telegram_id=None, allows_write_to_pm=True
    )

    db_session.flush()

    telegram_ids = user_service.get_all_writable_telegram_ids()
    assert 10001 in telegram_ids
    assert 10002 in telegram_ids
    assert 10003 not in telegram_ids
    assert None not in telegram_ids


def test_mark_as_not_writable_and_writable(db_session):
    user_service = UserService(db_session)

    user = UserFactory.with_session(db_session).create(
        telegram_id=20001, allows_write_to_pm=True
    )
    db_session.flush()

    assert user.allows_write_to_pm is True

    # Mark as not writable
    user_service.mark_as_not_writable([20001])
    db_session.refresh(user)
    assert user.allows_write_to_pm is False

    # Mark back as writable
    user_service.mark_as_writable(20001)
    db_session.refresh(user)
    assert user.allows_write_to_pm is True

    # Calling mark_as_writable on a non-existent user should be a safe no-op
    user_service.mark_as_writable(999999999)
    user_service.mark_as_not_writable([999999999])
