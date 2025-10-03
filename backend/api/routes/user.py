from fastapi import APIRouter, Depends
from fastapi.exceptions import HTTPException
from sqlalchemy.orm import Session
from starlette.requests import Request
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_200_OK

from api.deps import get_db_session
from api.pos.base import BaseExceptionFDO
from api.pos.user import UserFDO, UpdateUserWalletFDO
from api.pos.wallet import ConnectWalletRequestCPO, SetWalletRequestCPO
from core.actions.wallet import WalletAction
from core.exceptions.chat import TelegramChatNotExists
from core.exceptions.wallet import (
    UserWalletConnectedError,
    UserWalletConnectedAnotherUserError,
    ProofValidationError,
    UserWalletNotConnectedError,
)

user_router = APIRouter(prefix="/users")


@user_router.get("/me", tags=["User"])
async def get_user_data(
    request: Request,
) -> UserFDO:
    return UserFDO.from_orm(request.state.user)


@user_router.post(
    "/wallet",
    name="Connect user wallet to the chat with TON Proof",
    description="Connect a new wallet to the chat by providing TON proof and wallet details.",
    tags=["Wallet"],
    responses={
        HTTP_200_OK: {"model": UpdateUserWalletFDO},
        HTTP_400_BAD_REQUEST: {
            "description": (
                "Occurs when wallet is already connected to the chat, "
                "the requested wallet is already connected to another account "
                "or the requested chat is not found"
            ),
            "model": BaseExceptionFDO,
        },
    },
)
async def connect_user_wallet(
    request: Request,
    request_data: ConnectWalletRequestCPO,
    db_session: Session = Depends(get_db_session),
) -> UpdateUserWalletFDO:
    wallet_action = WalletAction(db_session)

    try:
        task_id = await wallet_action.connect_wallet(
            user_id=request.state.user.id,
            chat_slug=request_data.chat_slug,
            wallet_details=request_data.wallet_details,
        )
    except TelegramChatNotExists:
        raise HTTPException(
            detail="Chat not found",
            status_code=HTTP_400_BAD_REQUEST,
        )
    except ProofValidationError as e:
        raise HTTPException(
            detail=str(e),
            status_code=HTTP_400_BAD_REQUEST,
        )
    except UserWalletConnectedAnotherUserError:
        raise HTTPException(
            detail="Wallet already connected to another account",
            status_code=HTTP_400_BAD_REQUEST,
        )
    except UserWalletConnectedError:
        raise HTTPException(
            detail="Wallet already connected to chat.",
            status_code=HTTP_400_BAD_REQUEST,
        )

    return UpdateUserWalletFDO(
        user=UserFDO.from_orm(request.state.user),
        task_id=task_id,
    )


@user_router.put(
    "/wallet",
    name="Set connected user wallet for the chat",
    description="Allows to set previously connected wallet for the chat.",
    tags=["Wallet"],
    responses={
        HTTP_200_OK: {"model": UpdateUserWalletFDO},
        HTTP_400_BAD_REQUEST: {
            "description": (
                "Occurs when wallet is already connected to the chat, "
                "the requested wallet is not connected to the requestor "
                "or the requested chat is not found"
            ),
            "model": BaseExceptionFDO,
        },
    },
)
async def set_user_wallet(
    request: Request,
    request_data: SetWalletRequestCPO,
    db_session: Session = Depends(get_db_session),
) -> UpdateUserWalletFDO:
    wallet_action = WalletAction(db_session)
    try:
        await wallet_action.set_wallet(
            user_id=request.state.user.id,
            chat_slug=request_data.chat_slug,
            wallet_address=request_data.walletAddress,
        )
    except TelegramChatNotExists:
        raise HTTPException(
            detail="Chat not found",
            status_code=HTTP_400_BAD_REQUEST,
        )
    except UserWalletNotConnectedError:
        raise HTTPException(
            detail="The requested wallet is not connected",
            status_code=HTTP_400_BAD_REQUEST,
        )
    except UserWalletConnectedError:
        raise HTTPException(
            detail="Wallet already connected to chat.",
            status_code=HTTP_400_BAD_REQUEST,
        )

    return UpdateUserWalletFDO(
        user=UserFDO.from_orm(request.state.user),
        # No need to refresh wallet details if it is already a tracked wallet
        task_id=None,
    )
