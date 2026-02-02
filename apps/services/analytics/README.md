# Analytics Service

**Port:** 4005  
**Language:** Go 1.21  
**Role:** Event tracking, metrics collection, usage analytics

---

## Overview

The Analytics Service handles all analytics operations:

- Event tracking (searches, queries, interactions)
- User metrics and statistics
- System performance monitoring
- Usage patterns and trends
- Real-time analytics

---

## API Endpoints

### Health Check

```bash
GET /health
```

Response: `{"status": "ok", "service": "analytics-service", "time": "..."}`

### Ready Check

```bash
GET /ready
```

Response: `{"status": "ready"}` (checks DB connection)

### Track Event

```bash
POST /analytics/track
Content-Type: application/json

{
  "user_id": "uuid",
  "event_type": "search_entity",
  "metadata": "{\"query\": \"...\", \"results\": 42}"
}
```

Response: `{"status": "tracked"}` (202 Accepted)

### Get Statistics

```bash
GET /analytics/stats
```

Response: `{"total_events": 0, "active_users": 0, "avg_latency": 0, "uptime_hours": 24}`

---

## Database

Uses PostgreSQL with events, metrics, and sessions tables.

---

## Docker

```bash
docker build -t patriotchat-analytics:latest .
docker run -p 4005:4005 -e DB_HOST=postgres patriotchat-analytics:latest
```

---

## Testing

```bash
curl http://localhost:4005/health
curl http://localhost:4005/analytics/stats
```
