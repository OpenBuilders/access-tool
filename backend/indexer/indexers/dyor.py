import logging

import httpx
from httpx import Timeout, Response
from aiolimiter import AsyncLimiter

from core.constants import REQUEST_TIMEOUT, CONNECT_TIMEOUT, READ_TIMEOUT
from indexer.dtos.dyor import DyorJettonInfoResponse
from indexer.settings import indexer_settings


logger = logging.getLogger(__name__)
# Ref: https://dyor.io/tonapi#pricing
limiter = AsyncLimiter(max_rate=1, time_period=1.1)
timeout = Timeout(REQUEST_TIMEOUT, read=READ_TIMEOUT, connect=CONNECT_TIMEOUT)


class DyorIndexer:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url="https://api.dyor.io/",
            timeout=timeout,
            headers={"Authorization": indexer_settings.getgems_api_key},
        )

    async def _request(self, path: str) -> Response:
        async with limiter:
            response = await self.client.get(url=path)
            logger.debug(
                f"Received response from DYOR: {response.status_code} – {response.text[:50]}..."
            )
            response.raise_for_status()

        return response

    async def get_jetton_info(self, address: str) -> DyorJettonInfoResponse:
        response = await self._request(f"/v1/jettons/{address}")
        return DyorJettonInfoResponse.model_validate(response.json())
