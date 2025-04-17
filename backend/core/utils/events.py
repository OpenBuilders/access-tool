import logging
from typing import Any, Optional

from telethon.events.common import EventBuilder, EventCommon
from telethon.tl import TLObject
from telethon.tl.types import (
    UpdateBotChatInviteRequester,
    UpdateChannelParticipant,
    ChannelParticipantAdmin,
    ChannelParticipantSelf,
    User as TelethonUser,
    ChannelParticipantCreator,
    ChannelParticipantBanned,
)

from core.constants import REQUIRED_BOT_PRIVILEGES, REQUIRED_ADMIN_PRIVILEGES

logger = logging.getLogger(__name__)


class ChatJoinRequestEventBuilder(EventBuilder):
    @classmethod
    def build(
        cls, update: TLObject, others: Any = None, self_id: int | None = None
    ) -> Optional["Event"]:
        if isinstance(update, UpdateBotChatInviteRequester):
            return cls.Event(update=update)

    class Event(EventCommon):
        def __init__(self, *, update: UpdateBotChatInviteRequester):
            super().__init__(chat_peer=update.peer)
            self.original_update = update
            self.user_id = update.user_id

        @property
        def user(self):
            return self._entities.get(self.user_id)

        @property
        def invited_by_current_user(self) -> bool:
            return (
                self.original_update.invite
                and self.original_update.invite.admin_id == self.client._self_id
            )


class ChatAdminChangeEventBuilder(EventBuilder):
    @classmethod
    def build(
        cls, update: TLObject, others: Any = None, self_id: int | None = None
    ) -> Optional["Event"]:
        if (
            # Handle only channel participant updates
            isinstance(update, UpdateChannelParticipant)
            # Only handle admin changes
            and (
                isinstance(update.new_participant, ChannelParticipantAdmin)
                or isinstance(update.prev_participant, ChannelParticipantAdmin)
            )
            # Don't handle kicks as they are handled by another event
            and (update.new_participant is not None)
            and not isinstance(update.new_participant, ChannelParticipantBanned)
        ):
            return cls.Event(update=update)

    class Event(EventCommon):
        def __init__(self, *, update: UpdateChannelParticipant) -> None:
            super().__init__()
            self.original_update = update
            self.prev_participant = update.prev_participant
            self.new_participant = update.new_participant

        @property
        def is_self(self) -> bool:
            return (
                # Promoted from user to admin
                isinstance(self.prev_participant, ChannelParticipantSelf)
                # Demoted from admin to user
                or isinstance(self.new_participant, ChannelParticipantSelf)
                # Was admin already
                or (
                    isinstance(self.prev_participant, ChannelParticipantAdmin)
                    and self.prev_participant.is_self
                )
                # Became an admin
                or (
                    isinstance(self.new_participant, ChannelParticipantAdmin)
                    and self.new_participant.is_self
                )
            )

        @property
        def user(self) -> TelethonUser | None:
            if isinstance(self.new_participant, ChannelParticipantAdmin):
                return self._entities.get(self.new_participant.user_id)

            return self._entities.get(self.prev_participant.user_id)

        @property
        def is_demoted(self) -> bool:
            return isinstance(
                self.prev_participant, ChannelParticipantAdmin
            ) and not isinstance(
                self.new_participant,
                (ChannelParticipantAdmin, ChannelParticipantCreator),
            )

        @property
        def is_promoted(self) -> bool:
            return not isinstance(
                self.prev_participant, ChannelParticipantAdmin
            ) and isinstance(self.new_participant, ChannelParticipantAdmin)

        @property
        def has_enough_rights(self) -> bool:
            if self.user.bot:
                logger.warning(
                    f"This method should not be used on the bot users: {self.original_update}"
                )
                return False

            if not isinstance(self.new_participant, ChannelParticipantAdmin):
                logger.debug(
                    "User %d is not an admin in the chat %d",
                    self.user.id,
                    self.original_update.channel_id,
                )
                return False
            elif not all(
                [
                    getattr(self.new_participant.admin_rights, right)
                    for right in REQUIRED_ADMIN_PRIVILEGES
                ]
            ):
                logger.warning(
                    "User %d has insufficient permissions in the chat %d: %s",
                    self.user.id,
                    self.original_update.channel_id,
                    self.new_participant.admin_rights,
                )
                return False

            return True

        @property
        def sufficient_bot_privileges(self) -> bool:
            if not self.new_participant.is_self:
                raise ValueError("The event is not related to the bot user.")

            if not isinstance(self.new_participant, ChannelParticipantAdmin):
                logger.warning(
                    "Bot user is not an admin in the chat %d",
                    self.original_update.channel_id,
                )
                return False
            elif not all(
                [
                    getattr(self.new_participant.admin_rights, right)
                    for right in REQUIRED_BOT_PRIVILEGES
                ]
            ):
                logger.warning(
                    "Bot user has insufficient permissions in the chat %d: %s",
                    self.original_update.channel_id,
                    self.new_participant.admin_rights,
                )
                return False

            return True
