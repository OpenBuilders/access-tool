import pytest
from unittest.mock import patch, MagicMock

from core.actions.user import UserAction
from core.constants import CELERY_GIFT_USER_QUEUE_NAME
from tests.factories.user import UserFactory


@patch("core.actions.user.celery_app.send_task")
@patch("core.actions.user.RedisService")
def test_refresh_gifts_success(mock_redis_class, mock_send_task, db_session):
    # Mock Redis to allow the request
    mock_redis = MagicMock()
    mock_redis.set.return_value = True
    mock_redis_class.return_value = mock_redis

    mock_task_result = MagicMock()
    mock_task_result.id = "mock-task-123"
    mock_send_task.return_value = mock_task_result

    user_action = UserAction(db_session)
    user = UserFactory.with_session(db_session).create(telegram_id=555)
    db_session.flush()

    task_id = user_action.refresh_gifts(user)

    assert task_id == "mock-task-123"
    mock_redis.set.assert_called_once_with(
        "user-gift-refresh-555", "1", ex=300, nx=True
    )
    mock_send_task.assert_called_once_with(
        "index-user-gifts",
        args=(555,),
        queue=CELERY_GIFT_USER_QUEUE_NAME,
    )


@patch("core.actions.user.celery_app.send_task")
@patch("core.actions.user.RedisService")
def test_refresh_gifts_rate_limited(mock_redis_class, mock_send_task, db_session):
    # Mock Redis to block the request (nx=True returns False)
    mock_redis = MagicMock()
    mock_redis.set.return_value = False
    mock_redis_class.return_value = mock_redis

    user_action = UserAction(db_session)
    user = UserFactory.with_session(db_session).create(telegram_id=555)
    db_session.flush()

    task_id = user_action.refresh_gifts(user)

    assert task_id is None
    mock_redis.set.assert_called_once_with(
        "user-gift-refresh-555", "1", ex=300, nx=True
    )
    mock_send_task.assert_not_called()


def test_refresh_gifts_no_telegram_id(db_session):
    user_action = UserAction(db_session)
    user = UserFactory.with_session(db_session).create(telegram_id=None)
    db_session.flush()

    with pytest.raises(ValueError, match="has no linked Telegram ID"):
        user_action.refresh_gifts(user)


@patch.object(UserAction, "refresh_gifts")
def test_initial_user_indexing_with_telegram_id(mock_refresh_gifts, db_session):
    user_action = UserAction(db_session)
    user = UserFactory.with_session(db_session).create(telegram_id=777)
    db_session.flush()

    user_action._initial_user_indexing(user)

    mock_refresh_gifts.assert_called_once_with(user)


@patch.object(UserAction, "refresh_gifts")
def test_initial_user_indexing_without_telegram_id(mock_refresh_gifts, db_session):
    user_action = UserAction(db_session)
    user = UserFactory.with_session(db_session).create(telegram_id=None)
    db_session.flush()

    user_action._initial_user_indexing(user)

    mock_refresh_gifts.assert_not_called()
