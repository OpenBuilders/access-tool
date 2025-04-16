import logging
from pathlib import Path

from pytonapi.schema.jettons import JettonInfo
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session

from core.dtos.resource import JettonDTO
from core.actions.base import BaseAction
from core.constants import JETTON_LOGO_SUB_PATH, DEFAULT_EXPIRY_TIMEOUT_MINUTES
from core.services.cdn import CDNService
from core.services.jetton import JettonService
from core.services.superredis import RedisService
from core.utils.file import download_media
from indexer.indexers.tonapi import TonApiService


logger = logging.getLogger(__name__)


class JettonAction(BaseAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session)
        self.jetton_service = JettonService(db_session)
        self.blockchain_service = TonApiService()
        self.cdn_service = CDNService()
        self.redis_service = RedisService()

    async def prefetch(self, address_raw: str) -> JettonDTO:
        try:
            jetton = self.jetton_service.get(address_raw)
            logger.info(f"Jetton {address_raw!r} already exists in the database.")
            return JettonDTO.from_orm(jetton)
        except NoResultFound:
            logger.info(
                f"Jetton {address_raw!r} not found in the database. Prefetching..."
            )
            dto = await self.get_cached_blockchain_info(address_raw)
            return dto

    @staticmethod
    def _get_resource_cache_key(address_raw: str) -> str:
        return f"jetton:{address_raw}"

    async def get_cached_blockchain_info(self, address_raw: str) -> JettonDTO:
        """
        Fetches and caches blockchain information for a given jetton address.

        The function first checks if the blockchain information is already cached
        using the provided raw address. If cached data exists, it validates and
        returns it as a JettonDTO object. If no cached data exists, the function
        retrieves the data from the blockchain, constructs a JettonDTO object
        from the obtained information, caches the serialized data in Redis,
        and then returns the constructed DTO.

        :param address_raw: A string representing the raw address of the jetton
            for which the blockchain information needs to be fetched.
        :return: A `JettonDTO` object containing the blockchain information
            associated with the provided jetton raw address.
        """
        cached_value = self.redis_service.get(self._get_resource_cache_key(address_raw))
        if cached_value:
            logger.info("Using cached jetton info for %s", address_raw)
            dto = JettonDTO.model_validate_json(cached_value)
        else:
            logger.info("Fetching jetton info for %s from the API", address_raw)
            jetton_info, logo_path = await self._get_blockchain_info(
                address_raw=address_raw
            )
            dto = JettonDTO.from_info(
                jetton_info, logo_path.name if logo_path else None
            )
            logger.info("Caching jetton info for %s", address_raw)
            self.redis_service.set(
                self._get_resource_cache_key(address_raw),
                dto.model_dump_json(),
                ex=DEFAULT_EXPIRY_TIMEOUT_MINUTES * 60,
            )
        return dto

    async def _get_blockchain_info(
        self, address_raw: str
    ) -> tuple[JettonInfo, Path | None]:
        """
        Retrieves blockchain information for a given address including jetton metadata and
        downloads an associated logo if available. The metadata information is fetched from
        the blockchain service based on the provided address, while the logo is downloaded
        and uploaded to the CDN service if it exists.

        :param address_raw: Raw string representation of the blockchain address to retrieve
            the information for.
        :return: A tuple containing the jetton metadata information and the local path
            of the downloaded logo, if applicable. The logo path will be None if no logo
            exists for the jetton.
        """
        jetton_info: JettonInfo = await self.blockchain_service.get_jetton_info(
            address_raw
        )

        jetton_logo = jetton_info.metadata.image

        logo_path = None
        if jetton_logo:
            logo_path = download_media(
                jetton_logo, subdirectory=JETTON_LOGO_SUB_PATH, name=address_raw
            )
            if logo_path:
                await self.cdn_service.upload_file(
                    file_path=logo_path, object_name=logo_path.name
                )

        return jetton_info, logo_path

    async def create(self, address_raw: str) -> JettonDTO:
        dto = await self.get_cached_blockchain_info(address_raw)
        jetton = self.jetton_service.create(dto)

        # TODO think if we have to queue all the wallets whenever a new token is added to the list
        # wallet_service = WalletService(self.db_session)
        # all_wallets = list(wallet_service.get_all_wallet_addresses())
        #
        # # When the new jetton is created, we need to fetch wallet details for all wallets
        # # TODO: think about prioritization regular checks on events over these tasks
        # logger.info("Queuing tasks for fetching wallet details")
        # for wallet in all_wallets:
        #     fetch_wallet_details.apply_async(args=(wallet,))
        # logger.info("%d tasks queued", len(all_wallets))

        return JettonDTO.from_orm(jetton)

    async def get_or_create(self, address_raw: str) -> JettonDTO:
        try:
            jetton = self.jetton_service.get(address_raw)
            logger.info("Jetton %s already exists in the database.", jetton.name)
            return JettonDTO.from_orm(jetton)
        except NoResultFound:
            logger.info("Jetton %s not found in the database. Creating...", address_raw)
            return await self.create(address_raw)

    async def update(self, address_raw: str, is_enabled: bool) -> JettonDTO:
        jetton = self.jetton_service.update_status(address_raw, is_enabled)
        logger.info("Jetton %s updated", jetton.name)
        return JettonDTO.from_orm(jetton)
