import logging

from httpx import AsyncClient, Timeout

from core.constants import REQUEST_TIMEOUT, READ_TIMEOUT, CONNECT_TIMEOUT
from core.services.ton import TonPriceManager
from indexer.dtos.ton import TonPrice

timeout = Timeout(REQUEST_TIMEOUT, read=READ_TIMEOUT, connect=CONNECT_TIMEOUT)
logger = logging.getLogger(__name__)


class TonPriceIndexer:
    def __init__(self) -> None:
        self.client = AsyncClient(base_url="https://api.diadata.org", timeout=timeout)
        self.price_manager = TonPriceManager()

    async def index(self) -> float:
        """
        Fetches the latest price for the TON asset from the given API endpoint and sets
        the fetched price.

        This method performs an asynchronous GET request to obtain the current asset
        quotation for TON and validates the response. Upon success, it updates the
        price of TON and logs the operation.

        :raises HTTPError: If the HTTP request fails or returns an unsuccessful response code.
        :raises ValidationError: If the response cannot be validated against the TonPrice model.

        :return: The latest price of the TON asset.
        :rtype: float
        """
        response = await self.client.get(
            "/v1/assetQuotation/Ton/0x0000000000000000000000000000000000000000"
        )
        response.raise_for_status()
        ton_data = TonPrice.model_validate(response.json())
        logger.info(f"Got new price for TON: {ton_data.price}")
        self.price_manager.set_ton_price(ton_data.price)
        return ton_data.price
