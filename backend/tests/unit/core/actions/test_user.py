from unittest.mock import patch, MagicMock

from core.actions.user import UserAction
from core.constants import (
    CELERY_GIFT_USER_QUEUE_NAME,
    USER_GIFT_REFRESH_COOLDOWN_SECONDS,
)
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
        "user-gift-refresh-555", "1", ex=USER_GIFT_REFRESH_COOLDOWN_SECONDS, nx=True
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
        "user-gift-refresh-555", "1", ex=USER_GIFT_REFRESH_COOLDOWN_SECONDS, nx=True
    )
    mock_send_task.assert_not_called() @ patch.object(UserAction, "refresh_gifts")


def test_initial_user_indexing(mock_refresh_gifts, db_session):
    user_action = UserAction(db_session)
    user = UserFactory.with_session(db_session).create(telegram_id=777)
    db_session.flush()

    user_action._initial_user_indexing(user)

    mock_refresh_gifts.assert_called_once_with(user)
