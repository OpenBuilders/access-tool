import logging
from typing import AsyncGenerator

from aiogram import Bot
from aiogram.client.default import DefaultBotProperties
from aiogram.types import OwnedGifts, OwnedGiftUnique

from core.settings import core_settings

logger = logging.getLogger(__name__)


class BotApiGiftIndexer:
    def __init__(self):
        # Initialize Bot with the token from core settings
        self.bot = Bot(
            token=core_settings.telegram_bot_token,
            default=DefaultBotProperties(parse_mode="HTML"),
        )

    async def iter_user_gifts(
        self, telegram_user_id: int
    ) -> AsyncGenerator[OwnedGiftUnique, None]:
        """
        Yields OwnedGiftUnique objects owned by the user via pagination.
        Handles rate limits or pagination as needed.
        """
        offset = ""
        page_num = 1
        logger.info(f"Starting to fetch gifts for user {telegram_user_id}...")
        while True:
            try:
                logger.debug(
                    f"Fetching page {page_num} for user {telegram_user_id} (offset: {offset!r})"
                )
                # get_user_gifts is available in aiogram 3.24.0
                user_gifts: OwnedGifts = await self.bot.get_user_gifts(
                    user_id=telegram_user_id, offset=offset, limit=100
                )

                logger.info(
                    f"Fetched {len(user_gifts.gifts)} gifts for user {telegram_user_id} on page {page_num}."
                )

                # Yield only unique gifts from the current page
                for gift in user_gifts.gifts:
                    if isinstance(gift, OwnedGiftUnique):
                        yield gift

                # Check if there are more pages
                if not user_gifts.next_offset:
                    logger.info(
                        f"Finished fetching all gifts for user {telegram_user_id}. Total count: {user_gifts.total_count}"
                    )
                    break

                offset = user_gifts.next_offset
                page_num += 1

            except Exception as e:
                logger.error(f"Error fetching gifts for user {telegram_user_id}: {e}")
                break

    async def close(self):
        await self.bot.session.close()
