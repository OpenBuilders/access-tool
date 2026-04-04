import asyncio
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from aiogram import Bot
from aiogram.types import ChatInviteLink
from aiogram.exceptions import TelegramRetryAfter
from aiogram.client.default import DefaultBotProperties
from aiogram.client.session.aiohttp import AiohttpSession

from community_manager.settings import community_manager_settings

logger = logging.getLogger(__name__)


class TelegramBotApiService:
    def __init__(self) -> None:
        self.bot: Bot | None = None

    async def __aenter__(self) -> "TelegramBotApiService":
        session = AiohttpSession()
        self.bot = Bot(
            token=community_manager_settings.telegram_bot_token,
            session=session,
            default=DefaultBotProperties(parse_mode="MarkdownV2"),
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if self.bot:
            await self.bot.session.close()

    async def _safe_request(self, func, *args, **kwargs) -> Any:
        """
        Wraps a request with basic retry logic for 429s.
        """
        if not self.bot:
            raise RuntimeError(
                "TelegramBotApiService must be used as a context manager"
            )

        try:
            return await func(*args, **kwargs)
        except TelegramRetryAfter as e:
            logger.warning(f"Rate limited. Sleeping for {e.retry_after} seconds.")
            await asyncio.sleep(e.retry_after)
            return await func(*args, **kwargs)
        except Exception as e:
            logger.error(f"BotAPI Error: {e}", exc_info=True)
            raise e

    async def kick_chat_member(
        self, chat_id: int | str, user_id: int, ban_duration_minutes: int = 1
    ) -> bool:
        """
        Kicks a user from a chat by temporarily banning them.

        Args:
            chat_id: The chat ID to kick the user from
            user_id: The user ID to kick
            ban_duration_minutes: Duration of the ban in minutes (default: 1)
        """
        logger.info(
            f"Kicking user {user_id} from chat {chat_id} "
            f"(temp ban for {ban_duration_minutes} minute(s))"
        )
        # Calculate temporary ban until date
        until_date = datetime.now(timezone.utc) + timedelta(
            minutes=ban_duration_minutes
        )
        # Temporarily ban the user (allows rejoining after ban_duration_minutes)
        return await self._safe_request(
            self.bot.ban_chat_member,
            chat_id=chat_id,
            user_id=user_id,
            until_date=until_date,
        )

    async def unban_chat_member(self, chat_id: int | str, user_id: int) -> bool:
        """
        Unbans a user from a chat (allows them to join again).
        """
        logger.info(f"Unbanning user {user_id} from chat {chat_id}")
        return await self._safe_request(
            self.bot.unban_chat_member, chat_id=chat_id, user_id=user_id
        )

    async def send_message(
        self, chat_id: int | str, text: str, reply_markup: Any = None
    ) -> Any:
        """
        Sends a text message to a chat with optional reply markup.
        """
        logger.info(f"Sending message to chat {chat_id}: {text[:50]}...")
        return await self._safe_request(
            self.bot.send_message, chat_id=chat_id, text=text, reply_markup=reply_markup
        )

    async def create_chat_invite_link(
        self,
        chat_id: int | str,
        name: str | None = "Access Tool Invite Link",
        expire_date: int | None = None,
        member_limit: int | None = None,
    ) -> ChatInviteLink:
        """
        Creates a new invite link.
        """
        logger.info(f"Creating invite link for chat {chat_id}")
        return await self._safe_request(
            self.bot.create_chat_invite_link,
            chat_id=chat_id,
            name=name,
            expire_date=expire_date,
            member_limit=member_limit,
            creates_join_request=True,
        )

    async def revoke_chat_invite_link(
        self, chat_id: int | str, invite_link: str
    ) -> ChatInviteLink:
        """
        Revokes an invite link.
        """
        logger.info(f"Revoking invite link {invite_link} for chat {chat_id}")
        return await self._safe_request(
            self.bot.revoke_chat_invite_link, chat_id=chat_id, invite_link=invite_link
        )
