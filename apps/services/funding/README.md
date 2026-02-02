# Funding Service

**Port:** 4002  
**Language:** Go 1.21  
**Role:** Campaign finance and funding data aggregation, tracking contributions and expenditures

---

## Overview

The Funding Service handles all funding-related operations:

- FEC (Federal Election Commission) data fetching
- Campaign contribution tracking
- Funding source analysis
- Entity funding relationships
- Historical funding records

---

## API Endpoints

### Health Check

```bash
GET /health
```

Response: `{"status": "ok", "service": "funding-service", "time": "..."}`

### Ready Check

```bash
GET /ready
```

Response: `{"status": "ready"}` (checks DB connection)

### Search Funding

```bash
GET /funding/search?entity_id=<id>
```

Response: `{"entity_id": "...", "records": [...], "total": 0}`

### Record Funding

```bash
POST /funding/record
Content-Type: application/json

{
  "entity_id": "uuid",
  "amount": 10000.00,
  "source": "FEC",
  "recipient_id": "uuid",
  "date": "2026-02-02T00:00:00Z"
}
```

Response: `{"status": "recorded", "id": "uuid"}`

---

## Database

Uses PostgreSQL with funding and transaction tables for efficient querying by entity and date.

---

## Docker

```bash
docker build -t patriotchat-funding:latest .
docker run -p 4002:4002 -e DB_HOST=postgres patriotchat-funding:latest
```

---

## Testing

```bash
curl http://localhost:4002/health
curl "http://localhost:4002/funding/search?entity_id=test-id"
```
