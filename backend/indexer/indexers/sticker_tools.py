import logging

import httpx
from aiolimiter import AsyncLimiter
from httpx import Timeout, Response

from core.constants import REQUEST_TIMEOUT, CONNECT_TIMEOUT, READ_TIMEOUT
from indexer.dtos.sticker_tools import StickerToolsStats

logger = logging.getLogger(__name__)
# No rate limiter, but keeping for a future reference if any are
limiter = AsyncLimiter(max_rate=100, time_period=1)
timeout = Timeout(REQUEST_TIMEOUT, read=READ_TIMEOUT, connect=CONNECT_TIMEOUT)


class StickerToolsIndexer:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url="https://stickers.tools/",
            timeout=timeout,
        )

    async def _request(self, path: str) -> Response:
        async with limiter:
            response = await self.client.get(url=path)
            logger.debug(
                f"Received response from Sticker.tools: {response.status_code} – {response.text[:50]}..."
            )
            response.raise_for_status()

        return response

    async def get_stats(self) -> StickerToolsStats:
        response = await self._request("/api/stats-new")
        return StickerToolsStats.model_validate(response.json())
