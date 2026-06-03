import asyncio

from celery.utils.log import get_task_logger
from pytonapi.schema.jettons import JettonsBalances
from pytonapi.schema.nft import NftItems

from core.constants import (
    UPDATED_WALLETS_SET_NAME,
    CELERY_WALLET_FETCH_QUEUE_NAME,
    CELERY_NOTICED_WALLETS_UPLOAD_QUEUE_NAME,
)
from core.ext.tonapi import TonApiService
from core.services.db import DBService
from core.services.jetton import JettonService
from core.services.nft import NftCollectionService, NftItemService
from core.services.superredis import RedisService
from core.services.wallet import JettonWalletService, WalletService
from indexer_blockchain.celery_app import app
from indexer_blockchain.settings import blockchain_indexer_settings

logger = get_task_logger(__name__)


async def get_all_nfts_per_user(
    blockchain_service: TonApiService, address: str
) -> NftItems:
    nft_items = []
    # Query all NFT items in paginated batches
    async for batch in blockchain_service.get_all_nft_items_for_user(
        wallet_address=address, collection_address=None
    ):
        nft_items.extend(batch.nft_items)
    return NftItems(nft_items=nft_items)


@app.task(
    name="fetch-wallet-details",
    queue=CELERY_WALLET_FETCH_QUEUE_NAME,
)
def fetch_wallet_details(address: str) -> None:
    if address in blockchain_indexer_settings.blacklisted_wallets:
        logger.warning(f"Wallet {address!r} is blacklisted.")
        return

    # TODO: Refactor to an action
    blockchain_service = TonApiService()

    account_info = asyncio.run(blockchain_service.get_account_info(address))
    current_last_activity = account_info.last_activity
    raw_address = account_info.address.to_raw()

    with DBService().db_session() as db_session:
        wallet_service = WalletService(db_session)
        wallet = wallet_service.get_user_wallet(raw_address)
        stored_last_activity = wallet.last_activity if wallet else None

    if stored_last_activity is not None and current_last_activity is not None:
        if stored_last_activity == current_last_activity:
            logger.info(
                f"Skipping wallet {address!r} sync: last_activity has not changed ({current_last_activity})."
            )
            return

    jettons_balances: JettonsBalances = asyncio.run(
        blockchain_service.get_all_jetton_balances(address)
    )

    with DBService().db_session() as db_session:
        # Pre-calculate whitelist collection addresses for NFT fetch
        nft_collection_service = NftCollectionService(db_session)
        whitelisted_nfts = nft_collection_service.get_whitelisted()
        whitelist_collection_addresses = [
            collection.address for collection in whitelisted_nfts
        ]

    # Perform async NFT fetch OUTSIDE the DB session
    nft_items: NftItems = asyncio.run(
        get_all_nfts_per_user(
            blockchain_service=blockchain_service,
            address=address,
        )
    )

    # Pre-filter fetched NFT items against whitelisted collections in memory
    whitelist_set = set(whitelist_collection_addresses)
    filtered_nfts = [
        item
        for item in nft_items.nft_items
        if item.collection and item.collection.address.to_raw() in whitelist_set
    ]
    nft_items = NftItems(nft_items=filtered_nfts)

    with DBService().db_session() as db_session:
        wallet_service = WalletService(db_session)
        wallet_service.set_balance(
            raw_address,
            # It already contains the balance in nano
            int(str(account_info.balance)),
            last_activity=current_last_activity,
        )

        jetton_service = JettonService(db_session)
        whitelisted_jettons = jetton_service.get_all(whitelisted_only=False)

        jetton_wallet_service = JettonWalletService(db_session)
        jetton_wallet_service.bulk_create_or_update(
            jettons_balances, whitelisted_jettons, owner_address=address
        )
        logger.info(f"Jettons for {address!r} updated.")

        active_jetton_wallets = [
            balance.wallet_address.address.to_raw()
            for balance in jettons_balances.balances
        ]
        jetton_wallet_service.delete_missing(address, active_jetton_wallets)

        nft_service = NftItemService(db_session)
        _, evicted_owners = nft_service.bulk_create_or_update(
            nft_items, whitelist_collection_addresses
        )

        active_nft_items = [item.address.to_raw() for item in nft_items.nft_items]
        nft_service.delete_missing(address, active_nft_items)

    logger.info(f"NFT items for {address!r} updated.")
    redis_service = RedisService()
    redis_service.add_to_set(UPDATED_WALLETS_SET_NAME, address)
    for evicted_owner in evicted_owners - {address}:
        redis_service.add_to_set(UPDATED_WALLETS_SET_NAME, evicted_owner)


@app.task(
    name="load-noticed-wallets",
    queue=CELERY_NOTICED_WALLETS_UPLOAD_QUEUE_NAME,
)
def load_noticed_wallets():
    redis_service = RedisService(external=True)
    noticed_wallets = redis_service.get_unique_stream_items()
    logger.info(f"Loading {len(noticed_wallets)} noticed wallets")
    for wallet in noticed_wallets:
        fetch_wallet_details.apply_async(args=(wallet,))
