# Implementation Plan: Telegram Bot API Gift Indexing

**Branch**: `telegram-gifts-indexer` | **Date**: 2026-09-24 | **Spec**: [spec.md](spec.md)

## Summary

Track and index Telegram unique gifts via the official Telegram Bot API using three prioritized Celery queues. Replace the legacy Telethon implementation to properly index new user gifts on demand, and periodically background-sync all users to detect lost/transferred gifts to manage chat eligibility.

## Technical Context

**Language/Version**: Python 3.12+

**Primary Dependencies**: FastAPI, Celery, aiogram (3.24.0), SQLAlchemy

**Storage**: PostgreSQL, Redis

**Testing**: pytest

**Target Platform**: Linux Server (Dockerized)

**Project Type**: backend web service / background workers

**Performance Goals**: Support users with thousands of gifts without OOM; fast background sync (<1 min per task chunk).

**Constraints**: API rate limits from Telegram; Celery queue priority.

**Scale/Scope**: ~10s of thousands of users.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No violations.

## Project Structure

### Documentation (this feature)

```text
specs/telegram-gifts-indexer/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (future)
```

### Source Code

```text
backend/
├── src/
│   ├── core/
│   │   ├── actions/
│   │   ├── models/
│   │   └── services/
│   ├── api/
│   │   └── routes/
│   ├── indexer_gifts/
│   │   ├── actions/
│   │   ├── indexers/
│   │   └── celery_app.py
│   └── scheduler/
└── pyproject.toml
```

**Structure Decision**: Integrated directly into the existing `backend` monolithic FastAPI/Celery architecture. No new sub-projects needed.

## Complexity Tracking

N/A
