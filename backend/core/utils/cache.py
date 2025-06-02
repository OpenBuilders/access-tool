from pydantic import BaseModel

from core.services.superredis import RedisService


def cached_dto_result(
    cache_key: str, response_model: type[BaseModel], cache_ttl: int | None = None
):
    def wrapper(func):
        def inner(*args, **kwargs):
            redis_service = RedisService()
            if value := redis_service.get(cache_key):
                return response_model.model_validate_json(value)

            result = func(*args, **kwargs)
            redis_service.set(cache_key, result.model_dump_json(), ex=cache_ttl)
            return result

        return inner

    return wrapper
