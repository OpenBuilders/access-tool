# Access Community Tool – Project Overview

## 🎯 Purpose
Access is a comprehensive community management tool designed for blockchain and cryptocurrency communities. It enables token-gating, transaction tracking, and automated community management through Telegram integration.

## 📂 Project Structure
The project is organized into a modular monolith structure:

- **`backend/`**: Python-based services using FastAPI, Celery, and SQLAlchemy.
  - **[AGENTS.md](backend/AGENTS.md)**: Detailed backend architecture and practices.
- **`frontend/`**: React application built with Vite and TypeScript.
  - **[AGENTS.md](frontend/AGENTS.md)**: Detailed frontend architecture and practices.
- **`config/`**: Configuration templates and environment variable definitions.
- **`docker-compose.yml`**: Orchestrates the entire stack (API, workers, DB, Redis).

## 🛠 Key Commands (Root)
All major operations are wrapped in the `Makefile` for convenience.

| Command | Description |
|---------|-------------|
| `make build` | Build all Docker containers. |
| `make run` | Start the full application stack (detached). |
| `make stop` | Stop all running services. |
| `make setup-venv` | Set up local Python virtual environment and install dependencies. |
| `make test` | Run the test suite in a Docker container. |
| `make migrate` | Apply database migrations using Alembic. |

## 🚀 Getting Started for Agents
1. **Context**: Always check the specific `AGENTS.md` in subdirectories for deep-dive tasks.
2. **Environment**: The project relies heavily on Docker for execution but supports local development for Python and Node.js components.
3. **Configuration**: Use `config/env_template` as a reference for required environment variables.
