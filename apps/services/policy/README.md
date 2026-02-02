# Policy Service

**Port:** 4003  
**Language:** Go 1.21  
**Role:** Policy tracking, legislation analysis, bill history, and policy-entity relationships

---

## Overview

The Policy Service handles all policy-related operations:

- Bill and legislation tracking
- Policy status monitoring
- Entity policy positions
- Legislative history
- Policy impact analysis

---

## API Endpoints

### Health Check

```bash
GET /health
```

Response: `{"status": "ok", "service": "policy-service", "time": "..."}`

### Ready Check

```bash
GET /ready
```

Response: `{"status": "ready"}` (checks DB connection)

### Search Policies

```bash
GET /policy/search?entity_id=<id>
```

Response: `{"entity_id": "...", "policies": [...], "count": 0}`

### Record Policy

```bash
POST /policy/record
Content-Type: application/json

{
  "entity_id": "uuid",
  "title": "Policy Title",
  "description": "Policy details",
  "status": "active"
}
```

Response: `{"status": "recorded", "id": "uuid"}`

---

## Database

Uses PostgreSQL with policy, legislation, and positions tables.

---

## Docker

```bash
docker build -t patriotchat-policy:latest .
docker run -p 4003:4003 -e DB_HOST=postgres patriotchat-policy:latest
```

---

## Testing

```bash
curl http://localhost:4003/health
curl "http://localhost:4003/policy/search?entity_id=test-id"
```
