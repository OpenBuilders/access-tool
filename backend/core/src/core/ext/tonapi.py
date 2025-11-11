import asyncio
import logging
import time
from collections.abc import Callable, Awaitable, AsyncGenerator
from typing import Any

from pydantic import BaseModel
from pytonapi import AsyncTonapi
from pytonapi.exceptions import TONAPIInternalServerError, TONAPINotFoundError
from pytonapi.schema.accounts import Account
from pytonapi.schema.jettons import JettonHolders, JettonsBalances, JettonInfo
from pytonapi.schema.nft import NftItems, NftCollection

from core.dtos.resource import NftItemMetadataDTO, NftCollectionMetadataDTO
from core.exceptions.external import ExternalResourceNotFound
from core.settings import core_settings


logger = logging.getLogger(__name__)


DEFAULT_TONAPI_OFFSET = 0
DEFAULT_TONAPI_LIMIT = 1000
DEFAULT_TONAPI_MAX_RETRIES = 10


class TonApiService:
    def __init__(self):
        self._tonapi = AsyncTonapi(
            api_key=core_settings.ton_api_key,
            max_retries=DEFAULT_TONAPI_MAX_RETRIES,
        )

    @classmethod
    async def _get_all_paginated(
        cls,
        *,
        method: Callable[..., Awaitable[Any]],
        offset: int = DEFAULT_TONAPI_OFFSET,
        limit: int = DEFAULT_TONAPI_LIMIT,
        attribute_name: str = "items",
        **kwargs,
    ) -> AsyncGenerator[BaseModel]:
        current_offset = offset
        previous_run_start: float | None = None
        while True:
            # This is to avoid hitting the rate limit in the free tier
            if (
                previous_run_start
                and (to_wait := (time.time() - previous_run_start)) <= 1
            ):
                await asyncio.sleep(to_wait)

            previous_run_start = time.time()
            try:
                logger.debug(
                    "Fetching records from %s with offset %s and limit %s",
                    method.__name__,
                    current_offset,
                    limit,
                )
                records_dto = await method(
                    **kwargs,
                    offset=current_offset,
                    limit=limit,
                )
            except TONAPIInternalServerError:
                logger.exception("Failed to fetch records", exc_info=True)
                previous_run_start = time.time()
                continue

            yield records_dto

            # Not all methods return total count
            total_count = len(getattr(records_dto, attribute_name))

            if not total_count:
                logger.debug("No more records to fetch. Exiting")
                break

            logger.debug("Fetched %s records", total_count)
            current_offset += total_count

    async def get_account_info(
        self,
        account_id: str,
    ) -> Account:
        return await self._tonapi.accounts.get_info(account_id=account_id)

    async def get_all_jetton_holders(
        self, account_id: str
    ) -> AsyncGenerator[JettonHolders]:
        """
        Get all jettons' holders.

        :param account_id: Account ID
        :return: :class:`JettonHolders`
        """
        async for batch in self._get_all_paginated(
            method=self._tonapi.jettons.get_holders,
            account_id=account_id,
            attribute_name="addresses",
        ):
            batch: JettonHolders
            yield batch

    async def get_all_jetton_balances(self, account_id: str) -> JettonsBalances:
        """
        Get all jettons' balances.
        :param account_id: Account ID (wallet address)
        :return:
        """
        jetton_balances = await self._tonapi.accounts.get_jettons_balances(
            account_id=account_id,
        )
        return jetton_balances

    async def get_all_nft_items_for_user(
        self, wallet_address: str, collection_address: str | None = None
    ) -> AsyncGenerator[NftItems]:
        """
        Get all NFT items for the user.

        :param wallet_address: Wallet address
        :param collection_address: Collection address
        :return: list of NFT item addresses
        """
        async for batch in self._get_all_paginated(
            method=self._tonapi.accounts.get_nfts,
            account_id=wallet_address,
            collection=collection_address,
            attribute_name="nft_items",
        ):
            batch: NftItems
            yield batch

    async def get_all_nft_items(
        self, collection_address: str
    ) -> AsyncGenerator[NftItems]:
        """
        Get all NFT items.

        :param collection_address: Account ID (collection address)
        :return: list of NFT item addresses
        """

        async for batch in self._get_all_paginated(
            method=self._tonapi.nft.get_items_by_collection_address,
            account_id=collection_address,
            attribute_name="nft_items",
        ):
            batch: NftItems
            yield batch

    async def get_jetton_info(self, address: str) -> JettonInfo:
        """
        Get token details.

        :param address: Token address
        :return: Token details
        """
        try:
            return await self._tonapi.jettons.get_info(account_id=address)
        except TONAPINotFoundError:
            raise ExternalResourceNotFound(f"Token info about {address!r} not found")

    async def get_nft_collection_info(self, address: str) -> NftCollection:
        """
        Get NFT details.

        :param address: NFT address
        :return: NFT details
        """
        try:
            return await self._tonapi.nft.get_collection_by_collection_address(
                account_id=address
            )
        except TONAPINotFoundError:
            raise ExternalResourceNotFound(
                f"NFT collection info about {address!r} not found"
            )

    async def parse_nft_collection_metadata(
        self, address: str, partial: bool = True
    ) -> NftCollectionMetadataDTO:
        """
        Parse NFT collection metadata.

        :param address: NFT address
        :param partial: Partial parsing meaning that only the first batch will be fetched and based on it metadata will be returned
        :return: list of NFT collection attributes
        """
        items_metadata = []
        batch_idx = 1
        async for batch in self.get_all_nft_items(collection_address=address):
            logger.info("Processing batch %d of %s", batch_idx, address)
            nft_items = batch.nft_items
            for item in nft_items:
                items_metadata.append(NftItemMetadataDTO.from_nft_item(item))

            if partial:
                # When partial - break after the first batch
                break

            batch_idx += 1

        return NftCollectionMetadataDTO.from_items_metadata(
            items_metadata=items_metadata
        )
