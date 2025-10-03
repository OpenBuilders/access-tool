from fastapi import APIRouter, Depends
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from sqlalchemy.orm import Session
from starlette.responses import Response

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
from core.actions.stats import StatsCollectorAction


stats_router = APIRouter(prefix="/stats", tags=["Internal Stats"])


@stats_router.get("")
def get_stats(db_session: Session = Depends(get_db_session)) -> Response:
    stats_action = StatsCollectorAction(db_session)
    stats = stats_action.collect_stats()

    user_count_gauge.set(stats.total_users)
    chats_count_gauge.set(stats.total_chats)
    chat_members_count_gauge.set(stats.total_chat_users)
    managed_chat_members_count_gauge.set(stats.total_managed_chat_users)
    nft_collections_count_gauge.set(stats.total_nft_collections)
    nft_items_count_gauge.set(stats.total_nft_items)
    jettons_count_gauge.set(stats.total_jettons)
    jetton_wallets_count_gauge.set(stats.total_jettons)
    wallets_count_gauge.set(stats.total_wallets)

    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
