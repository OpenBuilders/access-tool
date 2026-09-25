import asyncio
import logging
from typing import Any, AsyncGenerator

from aiogram import Bot
from aiogram.client.default import DefaultBotProperties
from aiogram.exceptions import TelegramRetryAfter
from aiogram.types import OwnedGifts, OwnedGiftUnique

from core.settings import core_settings

logger = logging.getLogger(__name__)

MAX_FLOOD_RETRIES = 3


class BotApiGiftIndexer:
    def __init__(self):
        # Initialize Bot with the token from core settings
        self.bot = Bot(
            token=core_settings.telegram_bot_token,
            default=DefaultBotProperties(parse_mode="HTML"),
        )

    async def _safe_request(self, func, *args, **kwargs) -> Any:
        """
        Wraps a request with retry logic for Telegram flood control (429).
        """
        attempt = 1
        while True:
            try:
                return await func(*args, **kwargs)
            except TelegramRetryAfter as e:
                if attempt >= MAX_FLOOD_RETRIES:
                    logger.error(
                        f"Flood control: exceeded {MAX_FLOOD_RETRIES} retries, giving up."
                    )
                    raise
                logger.warning(
                    f"Flood control: sleeping {e.retry_after}s "
                    f"(attempt {attempt}/{MAX_FLOOD_RETRIES})"
                )
                await asyncio.sleep(e.retry_after)
                attempt += 1

    async def iter_user_gifts(
        self, telegram_user_id: int
    ) -> AsyncGenerator[OwnedGiftUnique, None]:
        """
        Yields OwnedGiftUnique objects owned by the user via pagination.
        Handles flood control by sleeping and retrying up to MAX_FLOOD_RETRIES times.
        """
        offset = ""
        page_num = 1
        logger.info(f"Starting to fetch gifts for user {telegram_user_id}...")
        while True:
            user_gifts: OwnedGifts = await self._safe_request(
                self.bot.get_user_gifts,
                user_id=telegram_user_id,
                offset=offset,
                limit=100,
            )

            logger.info(
                f"Fetched {len(user_gifts.gifts)} gifts for user "
                f"{telegram_user_id} on page {page_num}."
            )

            for gift in user_gifts.gifts:
                if isinstance(gift, OwnedGiftUnique):
                    yield gift

            if not user_gifts.next_offset:
                logger.info(
                    f"Finished fetching all gifts for user {telegram_user_id}. "
                    f"Total count: {user_gifts.total_count}"
                )
                break

            offset = user_gifts.next_offset
            page_num += 1

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()

    async def close(self):
        await self.bot.session.close()
        # Allow underlying aiohttp SSL connections to close gracefully
        await asyncio.sleep(0.250)
