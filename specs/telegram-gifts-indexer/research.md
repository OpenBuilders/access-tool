# Research: Telegram Bot API Gift Indexing

## Telegram Bot API Integration
- **Decision**: Use `aiogram` v3.24.0.
- **Rationale**: The official `aiogram` framework has built-in, type-safe support for all Telegram Bot API methods, including the new `getUserGifts` method and the `UniqueGift` type. This simplifies the payload parsing significantly compared to manual HTTP requests or raw `aiohttp`.
- **Alternatives considered**: Raw HTTP requests via `httpx` (rejected due to missing typing and boilerplate required) and legacy Telethon (rejected because Bot API handles this cleanly without full MTProto sessions).

## Data Model Mismatch Resolution
- **Decision**: Align internal CRUD operations in `GiftUniqueService` to use `slug` instead of integer `id`.
- **Rationale**: The Bot API returns `name` (a string slug) as the unique identifier for a `UniqueGift`, whereas the older implementation attempted to use an integer `id`. Aligning the service to the database's actual primary key (`slug`) bridges the gap seamlessly.

## Celery Task Prioritization
- **Decision**: Use `queue_order_strategy="priority"` with `worker_prefetch_multiplier=1` in Kombu/Celery.
- **Rationale**: We need three strict priority levels (Flow B > Flow A > Flow C). Without `prefetch_multiplier=1`, workers might reserve background tasks and block the priority queue. This native Kombu feature prevents starvation.
- **Alternatives considered**: Separate worker containers (rejected to save compute resources; 1 container can multiplex if configured correctly).
