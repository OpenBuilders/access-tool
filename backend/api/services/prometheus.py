from prometheus_client import Gauge


user_count_gauge = Gauge("user_count", "Current number of users in the database")
chats_count_gauge = Gauge("chats_count", "Current number of chats in the database")
chat_members_count_gauge = Gauge(
    "chat_members_count", "Current number of chat members in the database"
)
managed_chat_members_count_gauge = Gauge(
    "managed_chat_members_count",
    "Current number of managed chat members in the database",
)
nft_collections_count_gauge = Gauge(
    "nft_collections_count", "Current number of unique NFT collections in the database"
)
nft_items_count_gauge = Gauge(
    "nft_items_count", "Current number of unique NFT items in the database"
)
jettons_count_gauge = Gauge(
    "jettons_count", "Current number of unique jettons in the database"
)
jetton_wallets_count_gauge = Gauge(
    "jetton_wallets_count", "Current number of connected jetton wallets in the database"
)
wallets_count_gauge = Gauge(
    "wallets_count", "Current number of connected wallets in the database"
)
