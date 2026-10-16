# Architecture

Access Tool is designed as a modular monolith with a clear separation between the API, core logic, and background workers.

## Layers
- **API**: FastAPI endpoints.
- **Actions**: High-level business logic orchestration.
- **Services**: Database CRUD operations.
- **Models**: SQLAlchemy database models.

## Infrastructure
- **PostgreSQL**: Primary data store.
- **Redis**: Task queue and caching.
- **Celery**: Distributed task processing.
