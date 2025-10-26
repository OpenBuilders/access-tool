import asyncio
import logging

from sqlalchemy.orm import Session

from core.actions.authorization import AuthorizationAction
from core.models import TelegramChat
from core.services.chat import TelegramChatService
from core.services.jetton import JettonService
from core.services.nft import NftCollectionService
from core.services.sticker.character import StickerCharacterService
from core.services.sticker.collection import StickerCollectionService
from core.services.ton import TonPriceManager
from core.utils.price import calculate_floor_price
from indexer.dtos.dyor import VerificationStatus, DyorJettonInfoResponse
from indexer.dtos.getgems import GetGemsNftCollectionFloorResponse
from indexer.indexers.dyor import DyorIndexer
from indexer.indexers.getgems import GetGemsIndexer
from indexer.indexers.sticker_tools import StickerToolsIndexer
from indexer.indexers.ton import TonPriceIndexer

VALID_VERIFICATION_STATUSES = (
    VerificationStatus.JVS_APPROVED,
    VerificationStatus.JVS_COMMUNITY_APPROVED,
    VerificationStatus.JVS_VERIFIED,
)
MINIMUM_HOLDERS_COUNT_THRESHOLD = 50
MINIMUM_VOLUME_THRESHOLD = 1000
PRICE_BATCH_UPDATE_SIZE = 20

logger = logging.getLogger(__name__)


class PriceIndexerAction:
    def __init__(self, db_session: Session) -> None:
        self.db_session = db_session


class TonPriceIndexerAction(PriceIndexerAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session=db_session)
        self.indexer = TonPriceIndexer()

    async def refresh_toncoin_price(self) -> None:
        try:
            new_price = await self.indexer.index()
            logger.info(f"Successfully refreshed TON price. New price: {new_price}")
        except Exception as e:
            logger.exception(f"Error occurred while refreshing TON price: {e}")


class JettonPriceIndexerAction(PriceIndexerAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session=db_session)
        self.jetton_service = JettonService(db_session=db_session)
        self.indexer = DyorIndexer()

    @staticmethod
    def _validate_jetton_status(jetton_info: DyorJettonInfoResponse) -> bool:
        """
        Validates the jetton status against predefined criteria. The function checks whether the
        jetton satisfies the minimum holders count threshold and whether its verification status
        is among the valid statuses. If any of these criteria are not met, the function logs a
        warning with specific details and returns False. Otherwise, it returns True.

        :param jetton_info: Information about the jetton to be validated.
        :return: True if the jetton satisfies the validation criteria, otherwise False.
        """
        if jetton_info.details.holders_count < MINIMUM_HOLDERS_COUNT_THRESHOLD:
            logger.warning(
                f"Jetton {jetton_info.details.metadata.address!r} doesn't meet criteria. "
                f"It has {jetton_info.details.holders_count} holders, "
                f"while {MINIMUM_HOLDERS_COUNT_THRESHOLD} is required"
            )
            return False

        elif jetton_info.details.verification not in VALID_VERIFICATION_STATUSES:
            logger.warning(
                f"Jetton {jetton_info.details.metadata.address!r} doesn't meet criteria. "
                f"It has {jetton_info.details.verification!r} status, "
                f"white any of {VALID_VERIFICATION_STATUSES!r} is required"
            )
            return False

        return True

    async def refresh_jettons_price(self) -> None:
        """
        Asynchronously refreshes the prices of jettons by fetching their latest information
        and updates the database. The method processes all whitelisted jettons available in
        the service, validates their status, and updates prices in batches for efficiency.
        Commits changes to the database after processing all jetton prices and logs the process.
        """
        all_jettons = self.jetton_service.get_all(whitelisted_only=True)
        update_batch: dict[str, float] = {}
        for jetton in all_jettons:
            try:
                jetton_info = await self.indexer.get_jetton_info(jetton.address)
            except Exception as e:
                logger.exception(f"Error occurred while fetching jetton info: {e}")
                continue

            if not self._validate_jetton_status(jetton_info):
                continue

            logger.info(
                f"Got new price for {jetton.name=!r}: {jetton_info.details.price_usd.value}"
            )
            update_batch[jetton.address] = jetton_info.details.price_usd.value

            if len(update_batch) >= PRICE_BATCH_UPDATE_SIZE:
                self.jetton_service.batch_update_prices(update_batch)
                update_batch = {}

        # Ensure all jettons are updated, including the last batch
        self.jetton_service.batch_update_prices(update_batch)
        self.db_session.commit()
        logger.info("Successfully refreshed jettons prices")


class NftCollectionPriceIndexerAction(PriceIndexerAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session=db_session)
        self.nft_collection_service = NftCollectionService(db_session=db_session)
        self.ton_price_manager = TonPriceManager()
        self.indexer = GetGemsIndexer()

    @staticmethod
    def _validate_nft_collection_status(
        nft_collection_info: GetGemsNftCollectionFloorResponse,
    ) -> bool:
        if nft_collection_info.response.volume < MINIMUM_VOLUME_THRESHOLD:
            logger.warning(
                f"NFT collection {nft_collection_info.response.contract_address!r} doesn't meet criteria. "
                f"It has {nft_collection_info.response.volume} volume, "
                f"while {MINIMUM_VOLUME_THRESHOLD} is required"
            )
            return False

        if nft_collection_info.response.unique_owners < MINIMUM_HOLDERS_COUNT_THRESHOLD:
            logger.warning(
                f"NFT collection {nft_collection_info.response.contract_address!r} doesn't meet criteria. "
                f"It has {nft_collection_info.response.unique_owners} unique owners, "
                f"while {MINIMUM_HOLDERS_COUNT_THRESHOLD} is required"
            )
            return False

        return True

    async def refresh_nft_collections_price(self) -> None:
        if not (ton_price := self.ton_price_manager.get_ton_price()):
            logger.warning(
                "Cannot refresh NFT collections prices. TON price is not set"
            )
            return

        all_nft_collections = self.nft_collection_service.get_all(whitelisted_only=True)
        update_batch: dict[str, float] = {}
        for nft_collection in all_nft_collections:
            try:
                nft_collection_info = await self.indexer.get_collection_basic_info(
                    address=nft_collection.address
                )
            except Exception as e:
                logger.exception(f"Error occurred while fetching collection info: {e}")
                continue

            if not self._validate_nft_collection_status(nft_collection_info):
                continue

            price_usd = nft_collection_info.response.floor * ton_price
            logger.info(f"Got new price for {nft_collection.name=!r}: {price_usd}")
            update_batch[nft_collection.address] = price_usd

            if len(update_batch) >= PRICE_BATCH_UPDATE_SIZE:
                self.nft_collection_service.batch_update_prices(update_batch)
                update_batch = {}

        self.nft_collection_service.batch_update_prices(update_batch)
        self.db_session.commit()
        logger.info("Successfully refreshed NFT collections prices")


class StickerdomPriceIndexerAction(PriceIndexerAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session=db_session)
        self.indexer = StickerToolsIndexer()
        self.sticker_character_service = StickerCharacterService(db_session=db_session)
        self.sticker_collection_service = StickerCollectionService(
            db_session=db_session
        )

    async def refresh_stickerdom_price(self) -> None:
        try:
            stats = await self.indexer.get_stats()
            logger.info("Successfully fetch stickers stats.")
        except Exception as e:
            logger.exception(f"Error occurred while refreshing stickers prices: {e}")
            return

        update_batch: dict[tuple[int, int], float] = {}
        for collection in stats.collections.values():
            collection_prices = []
            for character in collection.characters.values():
                logger.info(
                    f"Got new price for {collection.name=!r} {character.name=!r}: {character.current.price.floor.usd}"
                )
                update_batch[
                    (collection.id, character.id)
                ] = character.current.price.floor.usd

                collection_prices.append(character.current.price.floor.usd)

                if len(update_batch) >= PRICE_BATCH_UPDATE_SIZE:
                    self.sticker_character_service.batch_update_prices(update_batch)
                    update_batch = {}

            collection_floor_price: float = min(collection_prices)
            self.sticker_collection_service.update_price(
                collection_id=collection.id, price=collection_floor_price
            )
            logger.info(
                f"Updated price for {collection.name=!r}: {collection_floor_price=}"
            )

        self.sticker_character_service.batch_update_prices(update_batch)
        self.db_session.commit()
        logger.info("Successfully refreshed stickers prices")


class ChatPriceRefresherAction(PriceIndexerAction):
    def __init__(self, db_session: Session) -> None:
        super().__init__(db_session=db_session)
        self.telegram_chat_service = TelegramChatService(db_session)
        self.authorization_action = AuthorizationAction(db_session)

    async def _refresh_chat_price(self, chat: TelegramChat) -> None:
        eligibility_rules = self.authorization_action.get_eligibility_rules(
            chat_id=chat.id,
            enabled_only=True,
        )
        new_price = calculate_floor_price(eligibility_rules)
        if new_price != chat.price:
            logger.info(f"Updating price for chat {chat.id!r}: {new_price}")
            self.telegram_chat_service.update_price(
                chat=chat, price=new_price, commit=False
            )
        else:
            logger.info(f"Price for chat {chat.id!r} hasn't changed")

    async def refresh_all(self, batch_size: int = 5) -> None:
        all_chats = self.telegram_chat_service.get_all(
            enabled_only=True, sufficient_privileges_only=True
        )
        for i in range(0, len(all_chats), batch_size):
            batch = all_chats[i : i + batch_size]
            logger.info(f"Processing batch {i // batch_size + 1}: {len(batch)} chats")

            # Process all chats in the current batch concurrently
            await asyncio.gather(
                *(self._refresh_chat_price(chat) for chat in batch),
                return_exceptions=True,  # Prevent one failure from stopping the batch
            )

        # Commit all changes after processing all batches
        self.db_session.commit()
        logger.info("Successfully refreshed all chat prices")
