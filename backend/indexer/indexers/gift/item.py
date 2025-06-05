import logging
from typing import AsyncGenerator

from core.dtos.gift.item import GiftUniqueDTO
from core.services.supertelethon import TelethonService
from indexer.settings import indexer_settings
from indexer.utils.gift import parse_collection_slug_from_gift_slug

logger = logging.getLogger(__name__)


class GiftUniqueIndexer:
    def __init__(self) -> None:
        self.telethon_service = TelethonService(
            session_path=indexer_settings.telegram_indexer_session_path
        )

    async def index_collection(
        self, collection_slug: str, upgraded_count: int
    ) -> AsyncGenerator[list[GiftUniqueDTO], None]:
        """
        Indexes all gifts from a specific collection using the telethon service. This process
        involves fetching a specific number of gifts from a collection, converting them into
        GiftUniqueDTO objects, and yielding them in batches of a defined size.

        :param collection_slug: The unique identifier of the collection to be indexed.
        :param upgraded_count: The total number of gifts to be indexed from the collection.
        :return: An asynchronous generator yielding lists of GiftUniqueDTO objects.
        """
        await self.telethon_service.start()
        entities = []
        for num in range(
            1, upgraded_count + 1, indexer_settings.telegram_batch_request_size
        ):
            gifts = await self.telethon_service.index_gifts_batch(
                slugs=[
                    f"{collection_slug}-{gift_id}"
                    for i in range(indexer_settings.telegram_batch_request_size)
                    if (gift_id := num + i) <= upgraded_count
                ]
            )

            logger.debug(
                f"Indexed gifts {num}...{num + indexer_settings.telegram_batch_request_size - 1} "
                f"for {collection_slug!r}."
            )

            entities.extend(
                [
                    GiftUniqueDTO.from_telethon(
                        collection_slug=collection_slug,
                        obj=gift,
                    )
                    for gift in gifts
                ]
            )

            if len(entities) >= indexer_settings.telegram_batch_processing_size:
                logger.info(f"Indexed {num} unique gifts for {collection_slug!r}.")
                yield entities
                entities = []

        yield entities
        # Free session for the next process
        await self.telethon_service.stop()
        return

    async def index_user_gifts(
        self,
        telegram_user_id: int,
    ) -> list[GiftUniqueDTO]:
        """
        Indexes and retrieves a list of unique gifts associated with a specific Telegram user.

        The function initiates a Telethon service session, fetches the gifts for a given
        Telegram user, and processes them to extract and organize unique gift details.
        If a gift's collection slug cannot be parsed from its slug, it logs a warning
        message and skips processing for that specific gift.

        :param telegram_user_id: The unique ID of the Telegram user whose gifts are
            being indexed.
        :return: A list of GiftUniqueDTO objects representing unique gifts associated
            with the given Telegram user.
        """
        await self.telethon_service.start()
        gifts = await self.telethon_service.index_user_gifts(telegram_user_id)
        entities = []
        for gift in gifts:
            if not (collection_slug := parse_collection_slug_from_gift_slug(gift.slug)):
                logger.warning(
                    f"Can't parse collection slug from gift slug {gift.slug!r}. Skipping. "
                )
                continue
            entities.append(
                GiftUniqueDTO.from_telethon(collection_slug=collection_slug, obj=gift)
            )
        await self.telethon_service.stop()
        return entities
