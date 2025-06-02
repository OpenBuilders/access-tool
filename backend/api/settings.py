import re

from pydantic import field_validator, Field

from core.settings import CoreSettings

API_TOKEN_REGEX = re.compile(r"^[a-zA-Z0-9\-\_]+$", re.ASCII)


class ApiSettings(CoreSettings):
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiry: int = 3600
    sentry_dns: str

    allowed_api_tokens: list[str] = Field(default_factory=list)

    @field_validator("allowed_api_tokens", mode="plain")
    @classmethod
    def validate_tokens(cls, value: str | None) -> list[str]:
        if value is None:
            return []

        if isinstance(value, str):
            values = [striped_v for v in value.split(",") if (striped_v := v.strip())]

        elif isinstance(value, list):
            values = value

        else:
            raise ValueError(
                f"Tokens should be either a list or a string. Currently it's {type(value): {value}}"
            )

        for value in values:
            if len(value) < 64:
                raise ValueError(f"Token {value!r} is too short")

            elif not API_TOKEN_REGEX.match(value):
                raise ValueError(f"Token {value!r} is invalid")

        return values

    internal_cdn_base_url: str


api_settings = ApiSettings()
