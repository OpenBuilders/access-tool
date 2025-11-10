import logging
from pathlib import Path
from tempfile import NamedTemporaryFile

from telethon.errors import BadRequestError

from core.dtos.gift.collection import GiftCollectionDTO
from core.exceptions.gift import GiftCollectionNotExistsError
from core.services.cdn import CDNService
from core.services.supertelethon import TelethonService

logger = logging.getLogger(__name__)


class GiftCollectionIndexer:
    def __init__(self, session_path: Path) -> None:
        self.telethon_service = TelethonService(session_path=session_path)
        self.cdn_service = CDNService()

    async def index(self, slug: str) -> GiftCollectionDTO:
        logger.info(f"Indexing gift collection {slug!r}...")
        await self.telethon_service.start()
        try:
            first_unique_gift = await self.telethon_service.index_gift(
                slug=slug,
                number=1,
            )
        except BadRequestError as exc:
            logger.exception(f"Gift Collection with slug {slug!r} not found.")
            raise GiftCollectionNotExistsError(
                f"Gift Collection with slug {slug!r} not found."
            ) from exc
        logger.info(f"Indexed gift collection {slug!r}.")
        logger.info(f"Downloading unique gift thumbnail for {slug!r}...")
        with NamedTemporaryFile(mode="w+b", delete=True) as tmp_file:
            file_name = await self.telethon_service.download_unique_gift_thumbnail(
                entity=first_unique_gift,
                target_location=tmp_file,
            )
            await self.cdn_service.upload_file(
                file_path=tmp_file.name, object_name=file_name
            )
            logger.info(
                f"Downloaded unique gift thumbnail for {slug!r}: {file_name!r}.."
            )
        # Free session for the next process
        await self.telethon_service.stop()
        return GiftCollectionDTO.from_telethon(
            slug=slug,
            obj=first_unique_gift,
            preview_url=file_name,
        )
