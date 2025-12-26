# Backend Documentation for Agents

## 🏗 Architecture
The backend is structured as a modular monolith using shared core logic.

### Layering Strategy
The code in `core` is organized into distinct layers to separate concerns:

- **Models** (`core/models/*.py`):
  - SQLAlchemy ORM classes representing database tables.
  - Pure data definitions, minimal logic.

- **DTOs** (`core/dtos/*.py`):
  - Data Transfer Objects (Pydantic or dataclasses) used for strict typing of data moving between layers (e.g., `TelegramUserDTO`).

- **Services** (`core/services/*.py`):
  - **Responsibility**: Database abstraction and basic CRUD.
  - **Usage**: Directly queries/commits to the DB.
  - **Example**: `UserService.create()` takes a DTO and persists a `User` model.
  - **Rule**: Should NOT contain complex business flows or cross-service orchestration.

- **Actions** (`core/actions/*.py`):
  - **Responsibility**: Business logic orchestration.
  - **Usage**: Calls multiple Services or other Actions. Handles the "what happens when X occurs" flow.
  - **Example**: `UserAction.create()` calls `UserService.create()` and then triggers `_initial_user_indexing`.
  - **Rule**: This is the entry point for API endpoints or Tasks where business rules are applied.

- **Utilities** (`core/utils/*.py`):
  - Pure functions or helpers (e.g., date parsing, hashing) that don't depend on application state.

### Key Components
- **`backend/core`**: The heart of the application. Contains database models, shared utilities, and base configuration. All other services depend on this.
- **`backend/api`**: FastAPI application serving REST endpoints.
- **`backend/workers`**: (Conceptually) includes `indexer_*`, `community_manager`, `scheduler`.

## 🧪 Testing Strategies

We follow a strict testing philosophy using `pytest`.

### Test Structure
- **Unit Tests** (`tests/unit`): Test Actions, Services, and Utils in isolation.
- **Functional Tests** (`tests/functional`): Test API endpoints and E2E flows.
- **Factories** (`tests/factories`): We use **Factory Boy** to generate test data. Do NOT manually create model instances in tests.
  ```python
  user = UserFactory(db_session=db_session, is_admin=True)
  ```
- **Fixtures** (`tests/conftest.py`):
  - `db_session`: A transactional database session. Rolled back after every test.
  - `mocker`: Used to mock external dependencies or lower layers (e.g., mocking a Service when testing an Action).

### Writing Tests
1. **Use Factories**: Always populate the DB using Factories.
2. **Mock Layers**: When testing an `Action`, mock the `Service` calls to isolate the orchestration logic.
3. **Transaction Rollback**: Rely on the `db_session` fixture to clean up data; no manual cleanup needed.

## 🛠 Tech Stack
- **Language**: Python 3.11.6
- **Framework**: FastAPI (API), Celery (Workers)
- **Database**: PostgreSQL (via SQLAlchemy 2.0+ async)
- **Cache/Queue**: Redis
- **Migrations**: Alembic

## 📦 Dependency Management
We use a layered requirements approach managed by `pip-tools`.
- **Primary Definition**: `pyproject.toml` files in each service directory (e.g., `backend/core/pyproject.toml`).
- **Compilation**: `requirements.txt` files are generated from `pyproject.toml`.
- **Installation**: Use `make setup-venv` from the root to install all dependencies.

**Important**: Do not edit `requirements.txt` directly. Edit `pyproject.toml` and run `make compile_requirements` (though this command is implied, usually handled via CI or manual make commands).

## 💻 Development Flow
### Running Tests
Tests are located in `tests/` and often require the Docker environment.

**Run All Tests:**
```bash
make test
```

**Run Specific Tests (Granular):**
To run specific test files or directories (e.g., only unit tests), use the `docker.sh` script:
```bash
# Run only unit tests
MODE=test ./docker.sh run --rm test pytest tests/unit

# Run a specific test file
MODE=test ./docker.sh run --rm test pytest tests/unit/core/actions/test_user.py
```

### Database Migrations
Migrations are managed via `alembic` in `backend/core`.
- **Generate**: `make generate-migration m="message"`
- **Apply**: `make migrate`

### Code Style
- **Linter/Formatter**: Ruff is used for linting and formatting. Ensure code complies with PEP 8.
