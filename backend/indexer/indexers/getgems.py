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
                f"Received response from GetGems: {response.status_code} – {response.text[:50]!r}..."
            )
            response.raise_for_status()
            return response

    async def get_collection_basic_info(
        self, address: str
    ) -> GetGemsNftCollectionFloorResponse:
        """
        Fetches basic information about an NFT collection given its address.

        This asynchronous method retrieves data from the specified endpoint, validates
        the response, and returns parsed NFT collection information.
        An exception is raised if the operation is unsuccessful.

        :param address: The unique address identifier of the NFT collection to query.
        :return: Parsed details about the NFT collection.
        :raises Exception: If the response indicates a failure in retrieving the
            collection's information.
        """
        path = f"v1/collection/basic-info/{address}"
        response = await self._request(path)
        nft_collection_info = GetGemsNftCollectionFloorResponse.model_validate(
            response.json()
        )
        if not nft_collection_info.success:
            raise Exception(
                f"Failed to get collection info for {address=!r}: {nft_collection_info}"
            )

        return nft_collection_info
