from pydantic import BaseModel


class StatsDTO(BaseModel):
    total_users: int
    total_chats: int
    total_chat_users: int
    total_managed_chat_users: int
    total_nft_collections: int
    total_nft_items: int
    total_gift_unique_items: int
    total_jettons: int
    total_wallets: int
