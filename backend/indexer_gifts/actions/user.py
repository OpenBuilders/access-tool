import logging
from sqlalchemy.orm import Session

from core.actions.base import BaseAction
from core.constants import UPDATED_GIFT_USER_IDS
from core.services.gift.collection import GiftCollectionService
from core.services.gift.item import GiftUniqueService
from core.services.superredis import RedisService
from core.services.user import UserService
from indexer_gifts.indexers.bot_api import BotApiGiftIndexer

logger = logging.getLogger(__name__)


class IndexerUserGiftAction(BaseAction):
    def __init__(self, db_session: Session):
        super().__init__(db_session)
        self.gift_service = GiftUniqueService(db_session)
        self.gift_collection_service = GiftCollectionService(db_session)
        self.redis_service = RedisService()
        self.user_service = UserService(db_session)

    async def sync_single_user_gifts(self, telegram_user_id: int) -> None:
        """Public method for single-user sync, manages the indexer lifecycle."""
        async with BotApiGiftIndexer() as indexer:
            try:
                await self._sync_user_gifts(telegram_user_id, indexer=indexer)
            except Exception as e:
                if "user not found" in str(e).lower():
                    self.user_service.mark_as_blocked([telegram_user_id])
                raise

    async def sync_users_batch(
        self,
        telegram_user_ids: list[int],
        existing_collection_ids: set[int] | None = None,
    ) -> None:
        """Public method for batch sync, manages a single indexer across multiple users."""
        blocked_user_ids = []
        async with BotApiGiftIndexer() as indexer:
            for user_id in telegram_user_ids:
                try:
                    await self._sync_user_gifts(
                        user_id,
                        indexer=indexer,
                        existing_collection_ids=existing_collection_ids,
                    )
                except Exception as e:
                    logger.error(f"Error refreshing gifts for user {user_id}: {e}")
                    if "user not found" in str(e).lower():
                        blocked_user_ids.append(user_id)

        if blocked_user_ids:
            self.user_service.mark_as_blocked(blocked_user_ids)

    async def _sync_user_gifts(
        self,
        telegram_user_id: int,
        indexer: BotApiGiftIndexer,
        existing_collection_ids: set[int] | None = None,
    ) -> None:
        """
        Internal business logic to sync unique gifts for a user using the provided indexer.
        """
        logger.info(f"Starting gifts synchronizing for user {telegram_user_id}")
        current_owned_slugs = set()
        lost_ownership_user_ids = set()
        created_count = 0
        updated_count = 0
        lost_count = 0

        # Prefetch collection IDs to avoid N+1 queries if not provided by batch caller
        if existing_collection_ids is None:
            existing_collection_ids = self.gift_collection_service.get_all_ids()

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
