class TelegramChatNotSufficientPrivileges(Exception):
    pass


class TelegramChatAlreadyExists(Exception):
    pass


class TelegramChatNotExists(Exception):
    pass


class TelegramChatInvalidExternalSourceError(Exception):
    ...
