from enum import StrEnum


class CustomTelegramChatOrderingRulesEnum(StrEnum):
    USERS_COUNT = "users-count"
    # TCV – Total Chat Value.
    # For more details, check where it's being calculated
    TCV = "tcv"
