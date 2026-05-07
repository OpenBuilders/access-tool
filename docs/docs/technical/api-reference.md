# API Reference

The Access Tool provides a RESTful API for management and integration.

## Base URL
`/api/v1`

## Authentication
Bearer Token (JWT) is required for most endpoints.

## Main Endpoints
- `GET /chats`: List all managed chats.
- `POST /chats`: Add a new chat.
- `GET /chats/{id}/rules`: List rules for a chat.
- `PUT /chats/{id}/control`: Update control level.

> [!NOTE]
> Detailed OpenAPI documentation is available at `/docs` (Swagger) and `/redoc` on the running instance.
