from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db_session
from api.services.prometheus import (
    user_count_gauge,
    chats_count_gauge,
    chat_members_count_gauge,
    managed_chat_members_count_gauge,
    nft_collections_count_gauge,
    nft_items_count_gauge,
    jettons_count_gauge,
    jetton_wallets_count_gauge,
    wallets_count_gauge,
)
from core.services.chat import TelegramChatService
from core.services.chat.user import TelegramChatUserService
from core.services.jetton import JettonService
from core.services.nft import NftCollectionService, NftItemService
from core.services.user import UserService
from core.services.wallet import JettonWalletService, WalletService


stats_router = APIRouter(prefix="/stats", tags=["Internal Stats"])


@stats_router.get("/users")
def get_users_stats(db_session: Session = Depends(get_db_session)):
    service = UserService(db_session)
    count = service.count()

    user_count_gauge.set(count)
    return {"count": count}


@stats_router.get("/chats")
def get_chats_stats(db_session: Session = Depends(get_db_session)):
    service = TelegramChatService(db_session)
    count = service.count()

    chats_count_gauge.set(count)
    return {"count": count}


@stats_router.get("/chats/members")
def get_chats_members_stats(db_session: Session = Depends(get_db_session)):
    service = TelegramChatUserService(db_session)
    all_chat_members = service.count()
    managed_chat_members = service.count(managed_only=True)

    chat_members_count_gauge.set(all_chat_members)
    managed_chat_members_count_gauge.set(managed_chat_members)
    return {
        "count": all_chat_members,
        "managed_count": managed_chat_members,
    }


@stats_router.get("/nft-collections")
def get_nft_collections_stats(db_session: Session = Depends(get_db_session)):
    service = NftCollectionService(db_session)
    collections_count = service.count()
    item_service = NftItemService(db_session)
    items_count = item_service.count()

    nft_collections_count_gauge.set(collections_count)
    nft_items_count_gauge.set(items_count)
    return {
        "count": collections_count,
        "items_count": items_count,
    }


@stats_router.get("/jettons")
def get_jettons_stats(db_session: Session = Depends(get_db_session)):
    service = JettonService(db_session)
    jettons_count = service.count()
    wallet_service = JettonWalletService(db_session)
    wallets_count = wallet_service.count()

    jettons_count_gauge.set(jettons_count)
    jetton_wallets_count_gauge.set(wallets_count)

    return {
        "count": jettons_count,
        "wallets_count": wallets_count,
    }


@stats_router.get("/wallets")
def get_wallets_stats(db_session: Session = Depends(get_db_session)):
    service = WalletService(db_session)
    count = service.count()

    wallets_count_gauge.set(count)

    return {"count": count}
