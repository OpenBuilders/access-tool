import logging

import httpx
from httpx import Timeout, Response
from aiolimiter import AsyncLimiter

from core.constants import REQUEST_TIMEOUT, CONNECT_TIMEOUT, READ_TIMEOUT
from indexer.dtos.getgems import GetGemsNftCollectionFloorResponse
from indexer.settings import indexer_settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ref: https://github.com/getgems-io/nft-contracts/blob/main/docs/read-api-en.md#limitations
limiter = AsyncLimiter(max_rate=400, time_period=60 * 5)
timeout = Timeout(REQUEST_TIMEOUT, read=READ_TIMEOUT, connect=CONNECT_TIMEOUT)


class GetGemsIndexer:
    def __init__(self):
        self.client = httpx.AsyncClient(
            base_url="https://api.getgems.io/public-api/",
            timeout=timeout,
            headers={"Authorization": indexer_settings.getgems_api_key},
        )

    async def _request(self, path: str, params: dict = None) -> Response:
        async with limiter:
            response = await self.client.get(
                path,
                params=params,
            )
            logger.info(
                f"Received response from GetGems: {response.status_code} – {response.text[:50]}..."
            )
            response.raise_for_status()
            return response

    async def get_collection_basic_info(
        self, address: str
    ) -> GetGemsNftCollectionFloorResponse:
        path = f"v1/collection/basic-info/{address}"
        response = await self._request(path)
        return GetGemsNftCollectionFloorResponse.model_validate(response.json())
