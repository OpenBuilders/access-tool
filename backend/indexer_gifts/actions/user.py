import logging
from sqlalchemy.orm import Session

from core.actions.base import BaseAction
from core.services.gift.item import GiftUniqueService
from core.services.gift.collection import GiftCollectionService
from core.services.superredis import RedisService
from core.constants import UPDATED_GIFT_USER_IDS
from indexer_gifts.indexers.bot_api import BotApiGiftIndexer

logger = logging.getLogger(__name__)


class IndexerUserGiftAction(BaseAction):
    def __init__(self, db_session: Session):
        super().__init__(db_session)
        self.gift_service = GiftUniqueService(db_session)
        self.gift_collection_service = GiftCollectionService(db_session)
        self.redis_service = RedisService()

    async def sync_user_gifts(
        self, telegram_user_id: int, existing_collection_ids: set[int] | None = None
    ) -> None:
        """
        Syncs unique gifts for a user using the Telegram Bot API.
        Identifies gifts the user lost and updates their database ownership.
        """
        logger.info(f"Starting gifts synchronizing for user {telegram_user_id}")
        indexer = BotApiGiftIndexer()
        current_owned_slugs = set()
        lost_ownership_user_ids = set()
        created_count = 0
        updated_count = 0
        lost_count = 0

        # Prefetch collection IDs to avoid N+1 queries if not provided by batch caller
        if existing_collection_ids is None:
            existing_collection_ids = self.gift_collection_service.get_all_ids()

        try:
            # 1. Fetch current gifts from Telegram API
            async for owned_gift in indexer.iter_user_gifts(telegram_user_id):
                ug = owned_gift.gift
                current_owned_slugs.add(ug.name)

                # Check if it exists
                existing = self.gift_service.find(ug.name)

                if existing:
                    # If it was owned by someone else, record they lost it
                    if (
                        existing.telegram_owner_id
                        and existing.telegram_owner_id != telegram_user_id
                    ):
                        lost_ownership_user_ids.add(existing.telegram_owner_id)

                    self.gift_service.update_ownership(
                        slug=ug.name,
                        telegram_owner_id=telegram_user_id,
                        blockchain_address=existing.blockchain_address,
                        owner_address=existing.owner_address,
                    )
                    updated_count += 1
                else:
                    # Ensure collection exists using in-memory cache
                    collection_id = int(ug.gift_id)
                    if collection_id not in existing_collection_ids:
                        logger.info(
                            f"Collection {collection_id} missing, creating stub collection."
                        )
                        self.gift_collection_service.create(
                            id=collection_id,
                            title=ug.base_name or f"Gift {collection_id}",
                            preview_url=None,
                            supply=0,
                            upgraded_count=0,
                        )
                        existing_collection_ids.add(collection_id)

                    # Extract string identifiers for visual attributes if available
                    model_name = (
                        getattr(ug.model, "name", None)
                        if getattr(ug, "model", None)
                        else None
                    )
                    backdrop_name = (
                        getattr(ug.backdrop, "name", None)
                        if getattr(ug, "backdrop", None)
                        else None
                    )
                    pattern_name = (
                        getattr(ug.symbol, "name", None)
                        if getattr(ug, "symbol", None)
                        else None
                    )

                    # Create new gift
                    self.gift_service.create(
                        slug=ug.name,
                        collection_id=collection_id,
                        number=ug.number,
                        model=model_name,
                        backdrop=backdrop_name,
                        pattern=pattern_name,
                        telegram_owner_id=telegram_user_id,
                        blockchain_address=None,
                        owner_address=None,
                    )
                    created_count += 1

            # 2. Fetch all gifts currently assigned to the user in the database
            db_gifts = self.gift_service.get_all(telegram_user_id=telegram_user_id)
            for db_gift in db_gifts:
                if db_gift.slug not in current_owned_slugs:
                    # User no longer owns this gift
                    self.gift_service.update_ownership(
                        slug=db_gift.slug,
                        telegram_owner_id=None,
                        blockchain_address=db_gift.blockchain_address,
                        owner_address=db_gift.owner_address,
                    )
                    lost_ownership_user_ids.add(telegram_user_id)
                    lost_count += 1

            # 3. Add users who lost ownership to the Redis set for community manager checking
            if lost_ownership_user_ids:
                logger.info(
                    f"Adding {len(lost_ownership_user_ids)} users to Redis for community manager check due to lost gifts."
                )
                for uid in lost_ownership_user_ids:
                    self.redis_service.add_to_set(UPDATED_GIFT_USER_IDS, str(uid))

            logger.info(
                f"Finished gifts synchronizing for user {telegram_user_id}. "
                f"Created: {created_count}, Updated: {updated_count}, Lost: {lost_count}."
            )
        finally:
            await indexer.close()
