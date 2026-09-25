# Spec: Telegram Bot API Gift Indexing

## 1. Description
A feature to track and index Telegram unique gifts owned by users through the official Telegram Bot API. This system will enable the platform to verify if a user possesses specific unique gifts required for membership in token-gated communities.

## 2. Motivation
Currently, the application lacks a robust method for fetching unique gifts. Because unique gifts act as access passes for restricted communities, we need an automated, reliable system to ensure that:
1. New users get their gifts indexed immediately upon joining.
2. The system periodically checks all users to detect if they transferred or lost a required gift.
3. Users can manually request a refresh if they just acquired a gift.

## 3. User Stories
- **As a new user**, when I join the application, my Telegram unique gifts are instantly indexed in the background without me having to do anything, so my chat eligibility is immediately evaluated.
- **As a user**, I can click a "Refresh Gifts" button on the UI, which will sync my latest gifts. To prevent spam, I can only do this once every 5 minutes.
- **As a community manager**, I want the system to continuously monitor chat members' gifts in the background, so that if a user transfers their required gift to someone else, they are automatically kicked from my gated chat.

## 4. Requirements
### Functional
- The system must communicate with the Telegram Bot API (`getUserGifts`).
- The system must map Telegram's `UniqueGift` correctly to the internal database (associating Bot API `name` to our `slug`, and `gift_id` to `collection_id`).
- There must be a prioritized flow: User-initiated actions (Flow B) must take precedence over background syncs (Flow C).
- Background sync (Flow C) must cover all registered users on a configurable interval (default 1 hour).
- The system must detect when a user no longer owns a gift they previously held, revoke their ownership in the database, and trigger an eligibility recheck.

### Non-Functional
- **Memory Safety**: The API client must process gifts page-by-page. It cannot load thousands of gifts into memory simultaneously.
- **Worker Availability**: Background tasks must be chunked (e.g., 25 users per task) so that Celery workers are not blocked for long periods.
- **Rate Limiting**: Manual refresh requests must be rate-limited at the API level (5 minutes).

## 5. Out of Scope
- Telegram Stars tracking.
- Non-unique (regular) gift tracking.
- UI/Frontend implementation (this spec covers the backend functionality only).
