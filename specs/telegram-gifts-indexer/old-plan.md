# Plan: Telegram Bot API Gift Indexing

## 1. Architecture Overview
The solution relies on Python (FastAPI + Celery) and PostgreSQL. It uses `aiogram` to communicate with the Telegram Bot API.
Tasks are segregated into prioritized Celery queues to guarantee responsive user-initiated indexing while allowing background syncs to run passively.

## 2. Data Model Changes
- Align `GiftUniqueService` with the database schema:
  - Methods (`get`, `find`, `create`, `update`, `update_ownership`) must use `slug` (string) as the primary identifier instead of `id` (integer).
  - Remove deprecated filter arguments (`number_ge`, `number_le`).
- The Bot API payload mapping:
  - `BotAPI.UniqueGift.name` -> `GiftUnique.slug`
  - `BotAPI.UniqueGift.gift_id` -> `GiftUnique.collection_id`

## 3. Queue & Worker Configuration
- Define queues in constants:
  - `gift-user-queue` (Priority 1)
  - `gift-fetch-queue` (Priority 2)
  - `gift-background-queue` (Priority 3)
- Update Celery worker configuration in `docker-compose.yml` to listen to these three queues in order.
- Set `worker_prefetch_multiplier = 1` and `queue_order_strategy = "priority"` to enforce strict priority.

## 4. API Endpoints
- **Endpoint**: `POST /api/users/me/gifts/refresh`
- **Dependency**: `validate_access_token`
- **Action**: `UserAction.refresh_gifts`
- **Rate Limit**: Uses Redis `SET nx ex=300`. Returns `{"status": "rate_limited"}` if locked.
- **Success**: Dispatches to `gift-user-queue` and returns `{"status": "pending", "task_id": "uuid"}`.

## 5. Indexing Logic & Sync Flows
### Bot API Client
- Create a `BotApiGiftIndexer` leveraging `aiogram.Bot.get_user_gifts`.
- Implement an `AsyncGenerator` to yield pages of `OwnedGiftUnique` to prevent out-of-memory errors for users with thousands of gifts.

### Flow B (User Initiated)
- `IndexerUserGiftAction.sync_user_gifts(user_id)`:
  - Consumes the async generator.
  - Upserts `GiftUnique` records using the `GiftUniqueService`.
  - Links `telegram_owner_id` to the current user.

### Flow C (Background Sync)
- **Master Task**: `refresh-all-user-gifts` runs hourly via Celery Beat.
  - Fetches all user IDs.
  - Batches them into chunks of 25.
  - Dispatches `refresh-users-gifts-batch` tasks to `gift-background-queue`.
- **Loss Detection**:
  - During sync, fetch all gifts currently owned by the user in the database.
  - Compare against the active stream from the Bot API.
  - If a database gift is not in the active stream, set `telegram_owner_id = None`.
  - Push the user ID to the `UPDATED_GIFT_USER_IDS` Redis set for the community manager to verify chat eligibility.

## 6. Deprecations
- Remove old Telethon-based tasks and indexers (`IndexerGiftCollectionAction`, `indexer_gifts/indexers/collection.py`, etc.).
