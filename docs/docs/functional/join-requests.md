# Join Requests Processing

When a user requests to join a private chat, Access Tool evaluates them based on active rules.

## Process Flow
1. User clicks "Join" on Telegram.
2. Telegram sends a `chat_join_request` update to the bot.
3. Access Tool backend checks the user against the chat's rules.
4. If approved, the request is accepted; otherwise, it is ignored or denied.
