from enum import Enum
from typing import Literal

from pydantic import BaseModel


class GatewayCommands(str, Enum):
    INDEX_CHAT = "index_chat"


class GatewayCommand(BaseModel):
    command_type: GatewayCommands


class IndexChatCommand(GatewayCommand):
    command_type: Literal[GatewayCommands.INDEX_CHAT] = GatewayCommands.INDEX_CHAT
    chat_id: int
    cleanup: bool = False
