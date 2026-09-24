# Data Model: Telegram Bot API Gift Indexing

## 1. Core Entities

### GiftUnique
Represents a specific, unique gift owned by a user (e.g., "SantaHat-1042").

**Fields**:
- `slug` (String, PK): The unique string identifier. Maps to Telegram `UniqueGift.name`.
- `collection_id` (String/Int, FK): References the parent collection. Maps to Telegram `UniqueGift.gift_id`.
- `number` (Int): The mint number of the gift.
- `model`, `backdrop`, `pattern` (String, Optional): Visual attributes.
- `telegram_owner_id` (Int, Optional): The Telegram user ID of the current owner. If null, the gift has no known owner on the platform.
- `blockchain_address`, `owner_address` (String, Optional): For blockchain-bridged gifts.

**Relationships**:
- Belongs to one `GiftCollection` (via `collection_id`).
- Owned by one `User` (via `telegram_owner_id`).

### Telegram API Models (via aiogram)

#### `UserGifts`
Returned by `getUserGifts` endpoint.
- `total_count` (Int): Total number of gifts owned.
- `gifts` (List[`OwnedGiftUnique`]): The paginated list of gifts.

#### `OwnedGiftUnique`
- `gift` (`UniqueGift`): The underlying gift definition.

#### `UniqueGift`
- `gift_id` (String): Maps to `collection_id`.
- `name` (String): Maps to `slug`.

## 2. Validation & State Transitions

- **Gift Transfer/Loss**: If a `GiftUnique` in our database has `telegram_owner_id = X`, but user X's Telegram `getUserGifts` API response does NOT contain this gift's `name` (slug), the gift's `telegram_owner_id` must transition to `NULL`.
- **Gift Gain**: If `getUserGifts` contains a gift `name` not currently associated with user X, it must be upserted with `telegram_owner_id = X`. If it was previously owned by Y, Y loses it.
