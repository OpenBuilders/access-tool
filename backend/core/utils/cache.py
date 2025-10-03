import logging

from pydantic import BaseModel

from core.services.superredis import RedisService


logger = logging.getLogger(__name__)


def cached_dto_result(
    cache_key: str, response_model: type[BaseModel], cache_ttl: int | None = None
):
    def wrapper(func):
        def inner(*args, **kwargs):
            redis_service = RedisService()
            if value := redis_service.get(cache_key):
                logger.debug(f"Cache hit for {cache_key}")
                return response_model.model_validate_json(value)

            logger.debug(f"Cache miss for {cache_key}")
            result = func(*args, **kwargs)
            redis_service.set(cache_key, result.model_dump_json(), ex=cache_ttl)
            logger.debug(f"Cache set for {cache_key}")
            return result

        return inner

    return wrapper
