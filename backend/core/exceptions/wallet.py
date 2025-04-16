class UserWalletNotConnectedError(Exception):
    pass


class UserWalletConnectedError(Exception):
    pass


class UserWalletConnectedAnotherUserError(Exception):
    pass


class ProofValidationError(Exception):
    pass
