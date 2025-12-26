import logging
import threading

from telethon import TelegramClient, events
from telethon.sessions import SQLiteSession

from community_manager.handlers.bot import handle_start_message
from community_manager.handlers.chat import (
    handle_join_request,
    handle_chat_action,
    handle_chat_participant_update,
)
from core.utils.probe import start_health_check_server
from community_manager.settings import community_manager_settings
from core.services.supertelethon import TelethonService
from community_manager.events import (
    ChatJoinRequestEventBuilder,
    ChatAdminChangeEventBuilder,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)


def init_client() -> TelethonService:
    # This session is not thread-safe and cannot be used by multiple clients at the same time.
    session = SQLiteSession(str(community_manager_settings.telegram_session_path))
    client = TelegramClient(
        session,
        community_manager_settings.telegram_app_id,
        community_manager_settings.telegram_app_hash,
    )
    service = TelethonService(
        client=client, bot_token=community_manager_settings.telegram_bot_token
    )
    return service


def add_event_handlers(service: TelethonService) -> TelethonService:
    service.client.add_event_handler(
        handle_start_message,
        # Handle start command in private chats only
        events.NewMessage(pattern="/start", func=lambda e: e.is_private),
    )
    service.client.add_event_handler(handle_join_request, ChatJoinRequestEventBuilder())
    service.client.add_event_handler(
        handle_chat_participant_update, ChatAdminChangeEventBuilder()
    )
    # Generic chat action handler should go at the very end
    service.client.add_event_handler(handle_chat_action, events.ChatAction())
    return service


def main() -> None:
    logger.info("Community Manager started.")
    telethon_service = init_client()
    telethon_service = add_event_handlers(telethon_service)

    health_thread = threading.Thread(
        target=start_health_check_server,
        args=(lambda: telethon_service.client.is_connected(),),
        daemon=True,
    )
    health_thread.start()

    telethon_service.start_sync()
    telethon_service.client.loop.run_until_complete(telethon_service.client.catch_up())
    telethon_service.client.run_until_disconnected()


if __name__ == "__main__":
    main()
