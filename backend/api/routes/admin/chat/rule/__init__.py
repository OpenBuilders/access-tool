from fastapi import APIRouter

from api.routes.admin.chat.rule.jetton import manage_jetton_rules_router
from api.routes.admin.chat.rule.nft import manage_nft_collection_rules_router
from api.routes.admin.chat.rule.premium import manage_premium_rules_router
from api.routes.admin.chat.rule.toncoin import manage_toncoin_rules_router
from api.routes.admin.chat.rule.whitelist import (
    manage_whitelist_rules_router,
    manage_external_whitelist_rules_router,
)

manage_rules_router = APIRouter(prefix="/rules", tags=["Chat Rules"])
manage_rules_router.include_router(manage_jetton_rules_router)
manage_rules_router.include_router(manage_nft_collection_rules_router)
manage_rules_router.include_router(manage_toncoin_rules_router)
manage_rules_router.include_router(manage_whitelist_rules_router)
manage_rules_router.include_router(manage_external_whitelist_rules_router)
manage_rules_router.include_router(manage_premium_rules_router)
