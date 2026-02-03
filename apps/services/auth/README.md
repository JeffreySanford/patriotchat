# Auth Service

**Port:** 4001  
**Language:** Go 1.21  
**Role:** User authentication, JWT token generation/validation, session management

---

## Overview

The Auth Service handles all authentication operations:

- User registration with email verification
- User login with JWT token generation
- Token validation for service-to-service communication
- Password hashing with bcrypt
- Audit logging for all authentication events
- OpenTelemetry instrumentation for distributed tracing

---

## API Endpoints

### Health Check

```bash
GET /health
```

Response: `{"status": "ok", "service": "auth-service", "time": "2026-02-02T..."}`

### Ready Check

```bash
GET /ready
```

Response: `{"status": "ready"}` (checks DB connection)

### Register User

```bash
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password"
}
```

Response: `{"token": "eyJ...", "user": {...}, "expires_at": "..."}`

### Login User

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}
```

Response: `{"token": "eyJ...", "user": {...}, "expires_at": "..."}`

### Validate Token

```bash
GET /auth/validate
Authorization: Bearer eyJ...
```

Response: `{"valid": true, "user_id": "uuid"}`

---

## Database

### Tables

- `users` - User accounts with password hashes and tier information
- `audit_logs` - All authentication events (insert, update, delete)
- `user_activity` - User login/action tracking

### Connection

```bash
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=patriotchat
```

---

## Environment Variables

```bash
# Service
PORT=4001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=patriotchat

# Security
JWT_SECRET=dev-secret-change-in-prod

# Observability
JAEGER_HOST=localhost
```

---

## Running Locally

### Build

```bash
go build -o auth src/main.go
```

### Run

```bash
PORT=4001 DB_HOST=localhost go run src/main.go
```

### Test

```bash
go test ./tests -v
```

---

## Docker

### Build Image

```bash
docker build -t patriotchat-auth:latest .
```

### Run Container

```bash
docker run -p 4001:4001 \
  -e DB_HOST=postgres \
  -e JWT_SECRET=your-secret \
  patriotchat-auth:latest
```

---

## Testing

### Unit Tests (JWT, validators)

```bash
go test ./tests -v -run TestGenerateJWT
go test ./tests -v -run TestValidateJWT
go test ./tests -v -run TestValidation
```

### Integration Tests (with real DB)

```bash
# Requires PostgreSQL running
docker-compose up postgres -d
go test ./tests -v -tags=integration
```

### E2E Tests (curl)

```bash
# Health check
curl http://localhost:4001/health

# Register
curl -X POST http://localhost:4001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com", "password": "pass123"}'

# Login
curl -X POST http://localhost:4001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "pass123"}'

# Validate token (replace TOKEN)
curl http://localhost:4001/auth/validate \
  -H "Authorization: Bearer TOKEN"
```

---

## Audit Trail

All authentication events are logged to `audit_logs` table:

- `REGISTER` - User registration
- `LOGIN` - User login
- `LOGIN_FAILED` - Failed login attempt
- `VALIDATE_TOKEN` - Token validation
- `HEALTH_CHECK` - Service health

Audit entries include:

- Timestamp
- User ID
- Operation type
- Operation status (success/failed)
- Correlation ID for request tracing

---

## Performance Targets


- Register: < 100ms
- Login: < 100ms
- Token validation: < 50ms

Monitored via OpenTelemetry traces to Jaeger.

---

## Security Considerations

- Passwords hashed with bcrypt (DefaultCost)
- JWT tokens valid for 24 hours
- All authentication events audited
- Service-to-service auth via JWT
- Database connections pooled (25 max, 5 idle)
- Secrets via environment variables (never hardcoded)

---

## References

- [Go JWT Guide](https://github.com/golang-jwt/jwt)
- [bcrypt in Go](https://golang.org/x/crypto)
- [PostgreSQL](https://www.postgresql.org/)
- [OpenTelemetry Go](https://github.com/open-telemetry/opentelemetry-go)
