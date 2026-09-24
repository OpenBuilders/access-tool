# Quickstart & Validation Guide

This guide describes how to validate the Telegram Bot API Gift Indexing functionality end-to-end.

## Prerequisites
- A running local environment (`make run` or equivalent Docker Compose stack).
- An authenticated test user with a connected Telegram account that owns at least one unique gift.
- A mocked or valid Telegram Bot API token configured in the environment.

## Scenario 1: Manual Refresh (Flow B)

1. **Trigger Refresh**:
   ```bash
   curl -X POST http://localhost:8000/api/users/me/gifts/refresh \
     -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
   ```
   **Expected Outcome**: Returns HTTP 200 with `{"status": "pending", "task_id": "..."}`.

2. **Verify Rate Limiting**:
   Run the identical command immediately after.
   **Expected Outcome**: Returns HTTP 200 with `{"status": "rate_limited"}`.

3. **Verify Database Upsert**:
   Check the `gift_unique` database table for the authenticated user.
   **Expected Outcome**: The user's gifts appear with their `telegram_owner_id` properly set.

## Scenario 2: Background Sync (Flow C)

1. **Trigger Master Task manually**:
   You can trigger the Celery task directly via a python shell or wait for the hourly scheduler.
   ```bash
   make test  # Or use a script to invoke `refresh-all-user-gifts.delay()`
   ```

2. **Simulate Gift Loss**:
   - Manually assign a gift in the DB to the test user (`telegram_owner_id = <ID>`).
   - Ensure the mocked Telegram API does *not* return this gift.
   - Run the background sync task again.
   
3. **Verify Revocation**:
   - Check the database: The gift's `telegram_owner_id` should now be `NULL`.
   - Check Redis: The set `UPDATED_GIFT_USER_IDS` should contain the user's ID.
