# API Contracts: Telegram Bot API Gift Indexing

## REST API (FastAPI)

### POST `/api/users/me/gifts/refresh`

Triggers a manual refresh of the authenticated user's Telegram unique gifts.

**Headers**:
- `Authorization`: `Bearer <token>`

**Response: Success (200 OK)**
```json
{
  "status": "pending",
  "task_id": "uuid-1234-5678",
  "message": "Gift indexing started."
}
```

**Response: Rate Limited (200 OK)**
```json
{
  "status": "rate_limited",
  "task_id": null,
  "message": "Gifts were recently indexed. Please wait 5 minutes."
}
```

**Response: Unauthorized (401 Unauthorized)**
```json
{
  "detail": "Could not validate credentials"
}
```

**Response: Bad Request (400 Bad Request)**
*(If the user has no linked Telegram ID)*
```json
{
  "detail": "User has no linked Telegram ID"
}
```
