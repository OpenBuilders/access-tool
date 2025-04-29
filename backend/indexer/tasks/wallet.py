import asyncio

from celery.utils.log import get_task_logger
from pytonapi.schema.jettons import JettonsBalances
from pytonapi.schema.nft import NftItems

from core.constants import (
    UPDATED_WALLETS_SET_NAME,
    CELERY_WALLET_FETCH_QUEUE_NAME,
    CELERY_NOTICED_WALLETS_UPLOAD_QUEUE_NAME,
)
from indexer.celery_app import (
    app,
)
from indexer.indexers.tonapi import TonApiService
from core.services.db import DBService
from core.services.jetton import JettonService
from core.services.nft import NftCollectionService, NftItemService
from core.services.superredis import RedisService
from core.services.wallet import JettonWalletService, WalletService
from indexer.settings import indexer_settings

logger = get_task_logger(__name__)


async def get_all_nfts_per_user(
    blockchain_service: TonApiService, address: str, nft_collections: list[str]
) -> NftItems:
    nft_items = []
    for collection_address in nft_collections:
        async for batch in blockchain_service.get_all_nft_items_for_user(
            wallet_address=address, collection_address=collection_address
        ):
            nft_items.extend(batch.nft_items)
    return NftItems(nft_items=nft_items)


@app.task(
    name="fetch-wallet-details",
    queue=CELERY_WALLET_FETCH_QUEUE_NAME,
)
def fetch_wallet_details(address: str) -> None:
    if address in indexer_settings.blacklisted_wallets:
        logger.warning(f"Wallet {address!r} is blacklisted.")
        return

    blockchain_service = TonApiService()

    account_info = asyncio.run(blockchain_service.get_account_info(address))

    jettons_balances: JettonsBalances = asyncio.run(
        blockchain_service.get_all_jetton_balances(address)
    )

    with DBService().db_session() as db_session:
        wallet_service = WalletService(db_session)
        wallet_service.set_balance(
            account_info.address.to_raw(),
            # It already contains the balance in nano
            int(str(account_info.balance)),
        )

        jetton_service = JettonService(db_session)
        whitelisted_jettons = jetton_service.get_all(whitelisted_only=False)

        jetton_wallet_service = JettonWalletService(db_session)
        jetton_wallet_service.bulk_create_or_update(
            jettons_balances, whitelisted_jettons, owner_address=address
        )
        logger.info(f"Jettons for {address!r} fetched.")

        nft_collection_service = NftCollectionService(db_session)
        whitelisted_nfts = nft_collection_service.get_whitelisted()
        whitelist_collection_addresses = [
            collection.address for collection in whitelisted_nfts
        ]

    nft_items: NftItems = asyncio.run(
        get_all_nfts_per_user(
            blockchain_service=blockchain_service,
            address=address,
            nft_collections=whitelist_collection_addresses,
        )
    )
    with DBService().db_session() as db_session:
        nft_service = NftItemService(db_session)
        nft_service.bulk_create_or_update(nft_items, whitelist_collection_addresses)

    logger.info(f"NFT items for {address!r} fetched.")
    redis_service = RedisService()
    redis_service.add_to_set(UPDATED_WALLETS_SET_NAME, address)


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
