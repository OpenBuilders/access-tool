# Implementation Tasks: Telegram Bot API Gift Indexing

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project configuration and basic structure.

- [x] T001 Update `backend/indexer_gifts/pyproject.toml` or `requirements.txt` to include `aiogram==3.24.0`.
- [x] T002 Update `backend/core/src/core/constants.py` with new queue constants (`CELERY_GIFT_USER_QUEUE_NAME`, `CELERY_GIFT_FETCH_QUEUE_NAME`, `CELERY_GIFT_BACKGROUND_QUEUE_NAME`).
- [x] T003 Update `docker-compose.yml` to set Celery worker arguments for the indexer (`-Q gift-user-queue,gift-fetch-queue,gift-background-queue` and `prefetch_multiplier=1`).
- [x] T004 Delete unused legacy Telethon indexer code (`backend/indexer_gifts/actions/collection.py`, `backend/indexer_gifts/indexers/collection.py`).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Update `GiftUniqueService` in `backend/core/src/core/services/gift/item.py` to use `slug` instead of `id` and remove legacy filters. (Note: partially done, but verify full alignment).
- [x] T006 Create `BotApiGiftIndexer` in `backend/indexer_gifts/indexers/bot_api.py` with an `AsyncGenerator` to yield pages of gifts efficiently.
- [x] T007 Implement core gift sync logic in `IndexerUserGiftAction.sync_user_gifts` in `backend/indexer_gifts/actions/user.py`, handling upserts and detection of lost gifts.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Background Indexing for New Users (Priority: P1) 🎯 MVP

**Goal**: As a new user, when I join the application, my Telegram unique gifts are instantly indexed in the background.

**Independent Test**: Trigger a new user creation event or call `_initial_user_indexing` directly and observe the background task executing.

### Implementation for User Story 1

- [x] T008 [US1] Create the `index-user-gifts` Celery task in `backend/indexer_gifts/tasks.py` that delegates to `IndexerUserGiftAction`.
- [x] T009 [US1] Add a call to trigger this indexing within `UserAction._initial_user_indexing` in `backend/core/src/core/actions/user.py`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Manual Refresh with Rate Limiting (Priority: P2)

**Goal**: As a user, I can click a "Refresh Gifts" button on the UI, which will sync my latest gifts. To prevent spam, I can only do this once every 5 minutes.

**Independent Test**: Use the quickstart guide's curl command to verify rate-limiting and success responses.

### Implementation for User Story 2

- [x] T010 [US2] Implement the `refresh_gifts` rate-limiting logic (using Redis) in `UserAction` inside `backend/core/src/core/actions/user.py`.
- [x] T011 [US2] Create the `POST /api/users/me/gifts/refresh` API endpoint in `backend/api/routes/user.py` conforming to the contract.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Background Sync (Priority: P3)

**Goal**: As a community manager, I want the system to continuously monitor chat members' gifts in the background, so that if a user transfers their required gift to someone else, they are automatically kicked.

**Independent Test**: Manually invoke the master task and verify users are chunked and background synced without blocking priority queues.

### Implementation for User Story 3

- [x] T012 [US3] Create the master dispatcher task `refresh-all-user-gifts` and the worker batch task `refresh-users-gifts-batch` in `backend/indexer_gifts/tasks.py`.
- [x] T013 [US3] Add the hourly schedule for `refresh-all-user-gifts` in `backend/scheduler/celery_app.py`.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T014 Run validation scenarios detailed in `specs/telegram-gifts-indexer/quickstart.md`.
- [x] T015 Verify Celery worker logs show correct prioritization of tasks.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.

### Parallel Opportunities

- All Setup tasks (T001 - T004) can be done in parallel.
- US2 API endpoints (T011) can be defined in parallel to US1 task creation (T008).
