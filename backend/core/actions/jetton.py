import logging
from tempfile import NamedTemporaryFile

from fastapi import HTTPException
from pytonapi.schema.jettons import JettonInfo
from sqlalchemy.exc import NoResultFound
from sqlalchemy.orm import Session
from starlette.status import HTTP_409_CONFLICT, HTTP_404_NOT_FOUND

from core.dtos.resource import JettonDTO
from core.actions.base import BaseAction
from core.constants import (
    DEFAULT_EXPIRY_TIMEOUT_MINUTES,
    DEFAULT_FILE_VERSION,
    DEFAULT_INCREMENTED_FILE_VERSION,
)
from core.services.cdn import CDNService
from core.services.jetton import JettonService
from core.services.superredis import RedisService
from core.utils.file import download_media, VersionedFile
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
            dto = await self.get_cached_blockchain_info(
                address_raw, version=DEFAULT_FILE_VERSION
            )
            return dto

    async def refresh(self, address_raw: str) -> JettonDTO:
        """
        Refreshes and updates the jetton details for a given address. Retrieves
        the current information from the blockchain for the specified address
        and updates the relevant jetton entry in the database. If the jetton
        does not exist in the database, raises an HTTP 404 exception.

        :param address_raw: The raw address of the jetton to refresh.
        :raises HTTPException: If the specified jetton address is not found
                               in the database.
        :return: The updated Jetton details as a data transfer object.
        :raises HTTPException: If the specified jetton address is not found in the database.
        """
        if not self.redis_service.set(
            f"refresh_details_{address_raw}", "1", ex=3600, nx=True
        ):
            logger.warning(
                f"Refresh details for {address_raw} was triggered already. Please wait for an hour to do it again."
            )
            raise HTTPException(
                status_code=HTTP_409_CONFLICT,
                detail=f"Refresh details for {address_raw} was triggered already. Please wait for an hour to do it again.",
            )

        try:
            jetton = self.jetton_service.get(address_raw)
        except NoResultFound:
            logger.error(f"Jetton {address_raw!r} not found in the database.")
            raise HTTPException(
                status_code=HTTP_404_NOT_FOUND,
                detail=f"Jetton {address_raw!r} not found in the database.",
            )

        logger.info(f"Refreshing jetton info for {address_raw!r}...")

        version = DEFAULT_INCREMENTED_FILE_VERSION
        if jetton.logo_path:
            previous_logo_path = VersionedFile.from_filename(jetton.logo_path)
            version = previous_logo_path.get_next_version()

        dto = await self._get_blockchain_info(address_raw, version=version)
        jetton = self.jetton_service.update(jetton=jetton, dto=dto)
        return JettonDTO.from_orm(jetton)

    @staticmethod
    def _get_resource_cache_key(address_raw: str) -> str:
        return f"jetton:{address_raw}"

    async def get_cached_blockchain_info(
        self, address_raw: str, version: int
    ) -> JettonDTO:
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
        :param version: An integer representing an incremented version of the jetton logo
        :return: A `JettonDTO` object containing the blockchain information
            associated with the provided jetton raw address.
        """
        cached_value = self.redis_service.get(self._get_resource_cache_key(address_raw))
        if cached_value:
            logger.info("Using cached jetton info for %s", address_raw)
            dto = JettonDTO.model_validate_json(cached_value)
        else:
            logger.info("Fetching jetton info for %s from the API", address_raw)
            dto = await self._get_blockchain_info(
                address_raw=address_raw, version=version
            )
        return dto

    async def _get_blockchain_info(self, address_raw: str, version: int) -> JettonDTO:
        """
        Retrieve jetton information and handle logo upload.

        This function interacts with the blockchain service to retrieve jetton-related
        information such as metadata and image/logo. If a jetton logo is found, it
        downloads the logo and uploads it using the CDN service to make it accessible
        through a specific path. The resulting jetton information and the optional
        uploaded logo path are returned.

        :param address_raw: A raw string representing the blockchain address of the
            jetton, used to retrieve its associated information.
        :param version: An integer representing an incremented version of the jetton logo
        :return: A tuple containing two elements:
            - An instance of JettonInfo with the retrieved metadata about the jetton.
            - A path to the uploaded logo file, or None if no logo was found or upload
              failed.
        """
        jetton_info: JettonInfo = await self.blockchain_service.get_jetton_info(
            address_raw
        )

        jetton_logo = jetton_info.metadata.image

        logo_path = None
        if jetton_logo:
            with NamedTemporaryFile(mode="w+b", delete=True) as tmp_file:
                file_extension = download_media(
                    jetton_logo,
                    target_location=tmp_file,
                )

                if file_extension:
                    # Make sure the cursor is set at the beginning to avoid empty files
                    tmp_file.seek(0)
                    versioned_file = VersionedFile(
                        base_name=address_raw,
                        version=version,
                        extension=file_extension,
                    )
                    logo_path = versioned_file.resolved_full_name
                    await self.cdn_service.upload_file(
                        file_path=tmp_file.name,
                        object_name=versioned_file.full_name,
                    )

        dto = JettonDTO.from_info(jetton_info, logo_path)
        logger.info("Caching jetton info for %s", address_raw)
        self.redis_service.set(
            self._get_resource_cache_key(address_raw),
            dto.model_dump_json(),
            ex=DEFAULT_EXPIRY_TIMEOUT_MINUTES * 60,
        )

        return dto

    async def create(self, address_raw: str) -> JettonDTO:
        dto = await self.get_cached_blockchain_info(
            address_raw, version=DEFAULT_FILE_VERSION
        )
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
