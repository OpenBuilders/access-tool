import logging
from typing import Generic

from httpx import HTTPError

from core.dtos.chat.rule.whitelist import WhitelistRuleItemsDifferenceDTO
from core.exceptions.chat import TelegramChatInvalidExternalSourceError
from core.models.rule import TelegramChatWhitelistExternalSource, TelegramChatWhitelist
from core.services.chat.rule.base import BaseTelegramChatRuleService, TelegramChatRuleT
from core.utils.external_source import fetch_dynamic_allowed_members

logger = logging.getLogger(__name__)


class BaseTelegramChatExternalSourceService(
    BaseTelegramChatRuleService,
    Generic[TelegramChatRuleT],
):
    def set_content(
        self, rule: TelegramChatRuleT, content: list[int]
    ) -> TelegramChatRuleT:
        rule.content = content
        self.db_session.flush()
        return rule


class TelegramChatExternalSourceService(
    BaseTelegramChatExternalSourceService[TelegramChatWhitelistExternalSource]
):
    model = TelegramChatWhitelistExternalSource

    @staticmethod
    async def validate_external_source(
        url: str,
        auth_key: str | None,
        auth_value: str | None,
        previous_content: list[int] | None = None,
        raise_for_error: bool = False,
    ) -> WhitelistRuleItemsDifferenceDTO | None:
        """
        Refreshes the external source for the Telegram chat whitelist.
        This method fetches the allowed members dynamically from an external source
        using the provided URL and authentication key/value.
        It handles errors gracefully by logging warning or exception messages and
        optionally re-raises the exceptions if specified.
        The actual update of the content is deferred to an asynchronous task to ensure
        proper processing and handling of ineligible members.

        :param url: The URL of the external source to be refreshed.
        :param auth_key: The authentication key for the external source.
        :param auth_value: The authentication value for the external source.
        :param previous_content: The previous content of the external source.
        :param raise_for_error: A flag indicating whether to re-raise exceptions encountered
                                during the update process. Defaults to False.
        """
        try:
            result = await fetch_dynamic_allowed_members(
                url,
                auth_key=auth_key,
                auth_value=auth_value,
            )
        except HTTPError as e:
            logger.warning(f"Failed to fetch external source {url!r}: {e}")
            if raise_for_error:
                raise
            return None
        except TelegramChatInvalidExternalSourceError as e:
            logger.warning(f"Invalid external source {url!r}: {e}")
            if raise_for_error:
                raise
            return None
        except Exception as e:
            logger.exception(f"Failed to fetch external source {url!r}: {e}")
            if raise_for_error:
                raise
            return None

        difference = WhitelistRuleItemsDifferenceDTO(
            previous=previous_content,
            current=result.users,
        )

        logger.info(f"Refreshed external source {url!r} successfully")
        return difference


class TelegramChatWhitelistService(
    BaseTelegramChatExternalSourceService[TelegramChatWhitelist]
):
    model = TelegramChatWhitelist
