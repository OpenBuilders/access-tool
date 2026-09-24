from core.services.user import UserService
from tests.factories.user import UserFactory


def test_get_all_telegram_ids(db_session):
    user_service = UserService(db_session)

    # Create some users with and without telegram_ids
    UserFactory.with_session(db_session).create(telegram_id=10001)
    UserFactory.with_session(db_session).create(telegram_id=10002)
    UserFactory.with_session(db_session).create(telegram_id=None)

    db_session.flush()

    telegram_ids = user_service.get_all_telegram_ids()
    assert 10001 in telegram_ids
    assert 10002 in telegram_ids
    assert None not in telegram_ids

    assert set([10001, 10002]).issubset(set(telegram_ids))
