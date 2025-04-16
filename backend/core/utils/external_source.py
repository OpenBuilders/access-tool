import logging

import httpx
from pydantic import ValidationError

from core.constants import REQUEST_TIMEOUT, READ_TIMEOUT, CONNECT_TIMEOUT
from core.dtos.chat.rules.whitelist import WhitelistRuleCPO
from core.exceptions.chat import TelegramChatInvalidExternalSourceError


logger = logging.getLogger(__name__)

timeout = httpx.Timeout(REQUEST_TIMEOUT, read=READ_TIMEOUT, connect=CONNECT_TIMEOUT)
sync_client = httpx.Client(timeout=timeout, follow_redirects=True)
async_client = httpx.AsyncClient(timeout=timeout, follow_redirects=True)


async def fetch_whitelist_members(url: str) -> WhitelistRuleCPO:
    response = await async_client.get(url)
    response.raise_for_status()
    try:
        validated_response = WhitelistRuleCPO.model_validate(
            response.json(), strict=True
        )
    except ValidationError as e:
        raise TelegramChatInvalidExternalSourceError(str(e))

    logger.info(f"Fetched {len(validated_response.users)} from {url}.")
    return validated_response
