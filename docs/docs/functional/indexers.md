# Indexers

Indexers are background processes that synchronize the state of Telegram chats with the local database.

## Architecture
Indexers run as Celery tasks and use the Telegram API to fetch member lists and updates.

- **Full Indexer**: Performs a complete scan of the chat's participants.
- **Incremental Indexer**: Listens for join/leave events to keep the database up-to-date.
