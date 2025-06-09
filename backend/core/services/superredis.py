from typing import Any, Set

import redis

from core.constants import ASYNC_TASK_REDIS_PREFIX
from core.settings import core_settings


class RedisService:
    def __init__(self, external: bool = False) -> None:
        self.client = redis.StrictRedis(
            host=core_settings.redis_host,
            port=core_settings.redis_port,
            db=(
                core_settings.redis_db
                if not external
                else core_settings.redis_transaction_db
            ),
            username=core_settings.redis_username,
            password=core_settings.redis_password,
            decode_responses=True,
        )

    def get(self, key: str) -> str:
        return self.client.get(key)

    def set(
        self, key: str, value: str, ex: int | None = None, nx: bool = False
    ) -> bool:
        """
        Set a key-value pair in the datastore.

        This method adds a new key-value pair to the datastore or updates the value
        of an existing key.
        It optionally supports specifying an expiration time for the key
        and conditional inserts for non-existing keys.

        :param key: The key to be set in the datastore.
        :param value: The value corresponding to the key to be set.
        :param ex: Optional expiration time in seconds for the key.
            Defaults to None, which means no expiration.
        :param nx: Boolean flag indicating if the key should only be set if it does
            not already exist.
            Defaults to False.
        :return: A boolean indicating whether the key was successfully set or not.
        """
        return self.client.set(key, value, ex=ex, nx=nx)

    def set_all(self, data: dict, ex: int | None = None) -> None:
        pipeline = self.client.pipeline()
        for key, value in data.items():
            pipeline.set(key, value, ex=ex)
        pipeline.execute()

    def add_to_set(self, name: str, *values: str) -> None:
        """
        Add a value to a set
        :param name: Name of the set
        :param values: Value to add
        :return: None
        """
        self.client.sadd(name, *values)

    def delete_from_set(self, name: str, *values: str) -> None:
        """
        Delete a value from a set
        :param name: Name of the set
        :param values: Value to delete
        :return: None
        """
        self.client.srem(name, *values)

    def pop_from_set(
        self, name: str, count: int | None = None
    ) -> str | list[str] | None:
        """
        Pop a value from a set
        :param name: Name of the set
        :param count: Number of values to pop
        :return: Value popped
        """
        return self.client.spop(name, count=count)

    def delete(self, key: str) -> str:
        return self.client.delete(key)

    def set_task_status(
        self, task_id: str, status: str, ex=core_settings.redis_task_status_expiration
    ) -> None:
        self.set(f"{ASYNC_TASK_REDIS_PREFIX}:{task_id}", status, ex=ex)

    def check_task_status(self, task_id: str) -> str:
        return self.get(f"{ASYNC_TASK_REDIS_PREFIX}:{task_id}")

    def pop_task_status(self, task_id: str) -> str:
        status = self.check_task_status(task_id)
        self.delete(f"{ASYNC_TASK_REDIS_PREFIX}:{task_id}")
        return status

    def get_stream_items(self) -> dict[str, Any]:
        """
        Get all items from the stream and delete them
        :return: dictionary of key-value pairs where key is the stream id and value is the item
        """
        result: list[list[str, dict[str, Any]]] = self.client.xread(
            {core_settings.redis_transaction_stream_name: "0-0"}
        )
        if not result:
            return {}

        consumed_items = dict(result[0][1])
        self.client.xdel(
            core_settings.redis_transaction_stream_name, *consumed_items.keys()
        )
        return consumed_items

    def get_unique_stream_items(self) -> Set[str]:
        return {item["wallet"] for item in self.get_stream_items().values()}
