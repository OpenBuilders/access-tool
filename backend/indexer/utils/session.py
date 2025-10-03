import logging
import sqlite3
import threading
from pathlib import Path

from celery import signals

from core.services.superredis import RedisService


logger = logging.getLogger(__name__)

SESSION_LOCK_KEY_TEMPLATE = "indexer:session:{session_id}:lock"
DEFAULT_SESSION_EXPIRATION_SECONDS = 60  # 1 minute
DEFAULT_TEMP_SESSION_EXPIRATION_SECONDS = 15  # 15 seconds
RENEW_SESSION_LOCK_INTERVAL_SECONDS = 30  # 30 seconds


active_managers = set()


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


class SessionLockManager:
    def __init__(
        self,
        session_dir_path: Path | None,
        renew_interval_seconds: int = RENEW_SESSION_LOCK_INTERVAL_SECONDS,
        cache_ttl: int = DEFAULT_SESSION_EXPIRATION_SECONDS,
    ) -> None:
        if not session_dir_path or not session_dir_path.is_dir():
            raise AttributeError(
                f"Invalid session directory path: {session_dir_path!r}"
            )

        self.session_dir_path = session_dir_path
        self.redis_service = RedisService()
        self.stop_event = threading.Event()
        self._lock_key = None
        self._renew_lock_thread = None
        self.renew_interval_seconds = renew_interval_seconds
        self._ttl = cache_ttl

    def acquire_lock(self, session_file: Path) -> bool:
        lock_key = SESSION_LOCK_KEY_TEMPLATE.format(session_id=session_file.name)
        is_locked = self.redis_service.set(
            lock_key, "1", ex=DEFAULT_SESSION_EXPIRATION_SECONDS, nx=True
        )

        if not is_locked:
            # It means that the lock was not acquired
            logger.warning(f"Session lock is already active: {lock_key!r}")
            return False

        if not check_available(session_file):
            # The session is not available despite lock was acquired
            logger.error(
                f"Session lock is not active but session is still unavailable: {session_file!r}"
            )
            # Set lock for 15 seconds so there won't be attempts to reuse that session as it seems to be blocked
            self.redis_service.expire(
                lock_key, ex=DEFAULT_TEMP_SESSION_EXPIRATION_SECONDS
            )
            return False

        self._lock_key = lock_key
        return True

    def release_lock(self) -> None:
        if not self._lock_key:
            logger.debug("No lock to release.")
            return

        logger.info(f"Releasing lock: {self._lock_key}")
        try:
            self.redis_service.delete(self._lock_key)
        except Exception as e:
            logger.exception(f"Failed to release lock: {e}")

    def _renew_loop(self) -> None:
        while not self.stop_event.wait(self.renew_interval_seconds):
            try:
                self.redis_service.expire(self._lock_key, self._ttl)
                logger.debug(f"Extended lock TTL: {self._lock_key}")
            except Exception as e:
                logger.exception(f"Failed to renew TTL for {self._lock_key}: {e}")

    def __enter__(self) -> Path:
        active_managers.add(self)
        target_session_file = None
        for session_file in self.session_dir_path.glob("*.session-dirty"):
            logger.warning(f"- DIRTY SESSION, please review: {session_file.name!r}")

        for session_file in self.session_dir_path.glob("*.session"):
            if not self.acquire_lock(session_file):
                continue

            target_session_file = session_file
            logger.info(f"Acquired session lock: {session_file.name!r}")
            break

        if not target_session_file:
            active_managers.discard(self)
            raise SessionUnavailableError(
                f"No available session found in {self.session_dir_path!r}"
            )

        self.renew_thread = threading.Thread(target=self._renew_loop, daemon=True)
        self.renew_thread.start()
        return target_session_file

    def __exit__(
        self, exc_type: Exception, exc_val: str, exc_tb: Exception.__traceback__
    ) -> None:
        self.stop_event.set()
        if self.renew_thread:
            self.renew_thread.join(timeout=self.renew_interval_seconds + 2)
        self.release_lock()
        active_managers.discard(self)


@signals.worker_shutdown.connect
def clean_up_locks_on_shutdown(*args, **kwargs):
    for manager in active_managers:
        manager.stop_event.set()
        if manager.renew_thread:
            logger.info(f"Waiting for renew thread to exit for {manager!r}")
            manager.renew_thread.join(timeout=manager.renew_interval_seconds + 2)
        manager.release_lock()
    active_managers.clear()
    logger.info("All locks have been released.")
