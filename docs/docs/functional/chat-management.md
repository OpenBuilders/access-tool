# Full Chat Management (Under-the-hood)

Full Chat Management relies on the interaction between the `TelegramChatManageAction` and the background workers.

## Key Actions
- `set_control_level`: Updates the database state and triggers initial indexing if necessary.
- `refresh_participants`: Orchestrates the full synchronization of the chat member list.

## Database Consistency
We use transactional sessions to ensure that participant states are always consistent across refreshes.
