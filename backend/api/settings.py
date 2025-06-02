import re

from pydantic import Field

from core.settings import CoreSettings

API_TOKEN_REGEX = re.compile(r"^[a-zA-Z0-9\-\_]+$", re.ASCII)


class ApiSettings(CoreSettings):
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expiry: int = 3600
    sentry_dns: str

    allowed_api_tokens_raw: str | None = Field(
        None, validation_alias="ALLOWED_API_TOKENS"
    )

    _allowed_api_tokens: list[str] = None

    @property
    def allowed_api_tokens(self) -> list[str]:
        """
        This property retrieves the allowed API tokens after validating raw tokens.
        It ensures tokens are properly validated before exposing them for use.

        :return: A list of valid API tokens.
        """
        if self._allowed_api_tokens is None:
            self._allowed_api_tokens = self.validate_tokens(self.allowed_api_tokens_raw)

        return self._allowed_api_tokens

    @classmethod
    def validate_tokens(cls, value: str | None) -> list[str]:
        # If it's an empty string or None
        if not value:
            return []

        if isinstance(value, str):
            values = [striped_v for v in value.split(",") if (striped_v := v.strip())]

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
