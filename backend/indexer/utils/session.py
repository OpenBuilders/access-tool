import contextlib
import logging
import sqlite3
from pathlib import Path
from typing import Generator

from core.services.superredis import RedisService


logger = logging.getLogger(__name__)

LOCK_KEY_TEMPLATE = "indexer:session:{session_id}:lock"
DEFAULT_SESSION_EXPIRATION_SECONDS = 1800  # 30 minutes
DEFAULT_TEMP_SESSION_EXPIRATION_SECONDS = 15  # 15 seconds


class SessionUnavailableError(Exception):
    pass


def check_available(session_file: Path) -> bool:
    """
    Determines the availability of an SQLite database file by attempting to
    acquire an exclusive lock. This function assesses whether the database
    can be safely accessed without contention.

    :param session_file: Path to the SQLite database file to check.
    :return: True if the database is available and not locked. False if it is
        currently locked by another process or connection.
    """
    try:
        with sqlite3.connect(session_file, timeout=0) as conn:
            conn.execute("BEGIN EXCLUSIVE")
        return True
    except sqlite3.OperationalError as e:
        if str(e).endswith("locked"):
            return False
        else:
            logger.error(
                f"Unexpected error occurred while checking DB availability: {e}"
            )
            raise e


@contextlib.contextmanager
def get_available_session_with_lock(
    session_dir_path: Path,
) -> Generator[Path, None, None]:
    """
    Acquire an available session file from the specified directory with a temporary lock. This function
    iterates through session files in the provided directory, attempting to acquire a lock for each
    eligible file. If a lock is obtained and the session is available, the function yields the session
    file for further use. The lock prevents concurrent usage of the same session file. Once processing
    is complete, the lock is released.

    :param session_dir_path: Path to the directory containing session files.
    :return: A generator yielding the path of the available session file with a lock.
    :raises AttributeError: If the session directory path is invalid or does not exist.
    :raises SessionUnavailableError: If no available session files are found in the directory.
    """
    if not session_dir_path.is_dir():
        raise AttributeError(f"Invalid session directory path: {session_dir_path!r}")

    redis_service = RedisService()
    target_session_file = None
    lock_key = None
    for session_file in session_dir_path.glob("*.session"):
        lock_key = LOCK_KEY_TEMPLATE.format(session_id=session_file.name)
        is_locked = redis_service.set(
            lock_key, "1", ex=DEFAULT_SESSION_EXPIRATION_SECONDS, nx=True
        )

        if not is_locked:
            # It means that the lock was not acquired
            logger.warning(f"Session lock is already active: {lock_key!r}")
            continue

        if not check_available(session_file):
            # The session is not available despite lock was acquired
            logger.error(
                f"Session lock is not active but session is still unavailable: {session_file!r}"
            )
            redis_service.delete(lock_key)
            # Set lock for 15 seconds so there won't be attempts to reuse that session as it seems to be blocked
            redis_service.set(lock_key, "1", ex=DEFAULT_TEMP_SESSION_EXPIRATION_SECONDS)
            continue

        logger.info(f"Acquired session lock: {lock_key!r}")
        target_session_file = session_file
        break

    if not target_session_file:
        raise SessionUnavailableError(
            f"No available session found in {session_dir_path!r}"
        )

    try:
        yield target_session_file
    finally:
        logger.info(f"Releasing session lock: {lock_key!r}")
        redis_service.delete(lock_key)
