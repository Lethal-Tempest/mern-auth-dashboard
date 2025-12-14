# API Documentation - MERN Auth Dashboard (Tasks)

**Base URL**: `http://localhost:5000/api`

**Authentication**: All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Table of Contents
1. [Health Check](#health-check)
2. [Authentication](#authentication)
3. [Profile (Users)](#profile-users)
4. [Tasks](#tasks)
5. [Error Responses](#error-responses)

---

## Health Check

### GET /health
Check if API is running.

**Request:**
```bash
curl http://localhost:5000/api/health
```

**Response (200):**
```json
{
  "ok": true
}
```

---

## Authentication

### POST /auth/register
Create a new user account.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daksh Arora",
    "email": "daksh@example.com",
    "password": "SecurePassword123"
  }'
```

**Body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| name | string | Yes | Min 2, max 80 characters |
| email | string | Yes | Valid email format |
| password | string | Yes | Min 6 characters |

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Daksh Arora",
    "email": "daksh@example.com"
  }
}
```

**Errors:**
| Status | Message | Reason |
|--------|---------|--------|
| 400 | Invalid input | Missing or invalid fields |
| 400 | Email already in use | Email exists in database |

---

### POST /auth/login
Authenticate and receive JWT token.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "daksh@example.com",
    "password": "SecurePassword123"
  }'
```

**Body:**
| Field | Type | Required |
|-------|------|----------|
| email | string | Yes |
| password | string | Yes |

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Daksh Arora",
    "email": "daksh@example.com"
  }
}
```

**Errors:**
| Status | Message | Reason |
|--------|---------|--------|
| 400 | Invalid input | Missing fields |
| 401 | Invalid credentials | Wrong email/password |

---

### POST /auth/logout
Logout (client-side: remove token from localStorage).

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/logout
```

**Response (200):**
```json
{
  "ok": true
}
```

---

## Profile (Users)

### GET /users/me
Fetch current authenticated user's profile.

**Request:**
```bash
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Daksh Arora",
    "email": "daksh@example.com"
  }
}
```

**Errors:**
| Status | Message | Reason |
|--------|---------|--------|
| 401 | Unauthorized | Missing/invalid JWT |
| 404 | User not found | User deleted or doesn't exist |

---

### PUT /users/me
Update current authenticated user's profile.

**Request:**
```bash
curl -X PUT http://localhost:5000/api/users/me \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Daksh Arora Updated",
    "email": "daksh.new@example.com"
  }'
```

**Body:**
| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| email | string | Yes |

**Response (200):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Daksh Arora Updated",
    "email": "daksh.new@example.com"
  }
}
```

**Errors:**
| Status | Message | Reason |
|--------|---------|--------|
| 400 | Invalid input | Missing/invalid fields |
| 400 | Email already in use | Email taken by another user |
| 401 | Unauthorized | Missing/invalid JWT |
| 404 | User not found | User deleted |

---

## Tasks

### POST /tasks
Create a new task.

**Request:**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete frontend assignment",
    "description": "Build React dashboard with auth",
    "status": "in_progress"
  }'
```

**Body:**
| Field | Type | Required | Options |
|-------|------|----------|---------|
| title | string | Yes | Min 2, max 120 characters |
| description | string | No | Max 2000 characters |
| status | string | No | `todo`, `in_progress`, `done` (default: `todo`) |

**Response (201):**
```json
{
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "owner": "507f1f77bcf86cd799439011",
    "title": "Complete frontend assignment",
    "description": "Build React dashboard with auth",
    "status": "in_progress",
    "createdAt": "2025-12-14T05:00:00Z",
    "updatedAt": "2025-12-14T05:00:00Z"
  }
}
```

**Errors:**
| Status | Message | Reason |
|--------|---------|--------|
| 400 | Invalid input | Missing/invalid fields |
| 401 | Unauthorized | Missing/invalid JWT |

---

### GET /tasks
Fetch all tasks for current user (with optional search & filter).

**Request:**
```bash
# All tasks
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search by title/description
curl "http://localhost:5000/api/tasks?search=frontend" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by status
curl "http://localhost:5000/api/tasks?status=done" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search + Filter
curl "http://localhost:5000/api/tasks?search=assignment&status=in_progress" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Query Parameters:**
| Param | Type | Optional | Description |
|-------|------|----------|-------------|
| search | string | Yes | Search in title/description (case-insensitive) |
| status | string | Yes | Filter by status: `todo`, `in_progress`, `done` |

**Response (200):**
```json
{
  "tasks": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "owner": "507f1f77bcf86cd799439011",
      "title": "Complete frontend assignment",
      "description": "Build React dashboard with auth",
      "status": "in_progress",
      "createdAt": "2025-12-14T05:00:00Z",
      "updatedAt": "2025-12-14T05:00:00Z"
    }
  ]
}
```

**Errors:**
| Status | Message | Reason |
|--------|---------|--------|
| 401 | Unauthorized | Missing/invalid JWT |

---

### PUT /tasks/:id
Update an existing task.

**Request:**
```bash
curl -X PUT http://localhost:5000/api/tasks/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "done"
  }'
```

**URL Parameters:**
| Param | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | MongoDB ObjectId |

**Body (any fields to update):**
| Field | Type |
|-------|------|
| title | string |
| description | string |
| status | string (`todo`, `in_progress`, `done`) |

**Response (200):**
```json
{
  "task": {
    "_id": "507f1f77bcf86cd799439012",
    "owner": "507f1f77bcf86cd799439011",
    "title": "Complete frontend assignment",
    "description": "Build React dashboard with auth",
    "status": "done",
    "createdAt": "2025-12-14T05:00:00Z",
    "updatedAt": "2025-12-14T05:01:00Z"
  }
}
```

**Errors:**
| Status | Message | Reason |
|--------|---------|--------|
| 400 | Invalid task id | Invalid MongoDB ObjectId |
| 400 | Invalid input | Invalid field values |
| 401 | Unauthorized | Missing/invalid JWT |
| 404 | Task not found | Task doesn't exist or belongs to different user |

---

### DELETE /tasks/:id
Delete a task.

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/tasks/507f1f77bcf86cd799439012 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**URL Parameters:**
| Param | Type | Required |
|-------|------|----------|
| id | string | Yes |

**Response (200):**
```json
{
  "ok": true
}
```

**Errors:**
| Status | Message | Reason |
|--------|---------|--------|
| 400 | Invalid task id | Invalid MongoDB ObjectId |
| 401 | Unauthorized | Missing/invalid JWT |
| 404 | Task not found | Task doesn't exist or belongs to different user |

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description here"
}
```

### Common Errors

**401 Unauthorized:**
```json
{
  "message": "Unauthorized"
}
```
**Cause**: Missing or invalid JWT token  
**Fix**: Add valid JWT in `Authorization: Bearer <token>` header

**400 Bad Request:**
```json
{
  "message": "Invalid input"
}
```
**Cause**: Missing or malformed request body  
**Fix**: Check request body matches API spec

**404 Not Found:**
```json
{
  "message": "Task not found"
}
```
**Cause**: Resource doesn't exist or belongs to different user  
**Fix**: Verify resource ID

**500 Server Error:**
```json
{
  "message": "Server error"
}
```
**Cause**: Unexpected server issue  
**Fix**: Check server logs

---

## Testing with cURL

### Complete Flow Example

```bash
# 1. Register
REGISTER=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }')

# Extract token
TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# 2. Create task
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Task",
    "status": "todo"
  }'

# 3. Get all tasks
curl http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# 4. Logout
curl -X POST http://localhost:5000/api/auth/logout
```

---

## Rate Limiting & Best Practices

- No rate limiting currently implemented (add for production)
- Keep JWT tokens secret (don't share in logs/messages)
- Use HTTPS in production
- Refresh tokens for long sessions (future enhancement)
- Add request timeouts to prevent hanging requests

---

## Version Info
- **API Version**: 1.0.0
- **Last Updated**: December 2025
- **Status**: Production-ready (single-server)
