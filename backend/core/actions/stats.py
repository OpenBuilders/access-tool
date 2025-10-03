from sqlalchemy.orm import Session

from core.actions.base import BaseAction
from core.dtos.stats import StatsDTO
from core.services.chat import TelegramChatService
from core.services.chat.user import TelegramChatUserService
from core.services.gift.item import GiftUniqueService
from core.services.jetton import JettonService
from core.services.nft import NftCollectionService, NftItemService
from core.services.stats import StatsService
from core.services.wallet import WalletService
from core.utils.cache import cached_dto_result


class StatsCollectorAction(BaseAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session)
        self.nft_collection_service = NftCollectionService(db_session)
        self.nft_item_service = NftItemService(db_session)
        self.jetton_service = JettonService(db_session)
        self.telegram_chat_service = TelegramChatService(db_session)
        self.telegram_chat_user_service = TelegramChatUserService(db_session)
        self.wallet_service = WalletService(db_session)
        self.gift_service = GiftUniqueService(db_session)

        self.stats_service = StatsService(db_session)

    @cached_dto_result(
        cache_key="prometheus_stats", response_model=StatsDTO, cache_ttl=60 * 60
    )
    def collect_stats(self) -> StatsDTO:
        total_users = self.user_service.count()
        total_chats = self.telegram_chat_service.count()
        total_chat_users = self.telegram_chat_user_service.count()
        total_managed_chat_users = self.telegram_chat_user_service.count(
            managed_only=True
        )
        total_nft_collections = self.nft_collection_service.count()
        total_nft_items = self.nft_item_service.count()
        total_gift_unique_items = self.gift_service.count()
        total_jettons = self.jetton_service.count()
        total_wallets = self.wallet_service.count()
        dto = StatsDTO(
            total_users=total_users,
            total_chats=total_chats,
            total_chat_users=total_chat_users,
            total_managed_chat_users=total_managed_chat_users,
            total_nft_collections=total_nft_collections,
            total_nft_items=total_nft_items,
            total_gift_unique_items=total_gift_unique_items,
            total_jettons=total_jettons,
            total_wallets=total_wallets,
        )
        self.stats_service.create(dto)
        return dto
