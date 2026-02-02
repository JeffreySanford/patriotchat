# API Gateway Service

NestJS-based API Gateway for PatriotChat microservices.

## Features

- JWT authentication
- 4-dimensional rate limiting (IP, user, endpoint, tier)
- Service routing and proxying
- Health checks

## API Endpoints

### Health Check

```bash
GET /health
```

### Ready Check

```bash
GET /ready
```

### User Registration

```bash
POST /auth/register
Content-Type: application/json

{
  "username": "user123",
  "email": "user@example.com",
  "password": "secure_password"
}
```

### User Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### Token Validation

```bash
GET /auth/validate
Authorization: Bearer <JWT_TOKEN>
```

### Get Current User

```bash
GET /auth/me
Authorization: Bearer <JWT_TOKEN>
```

## Rate Limiting

Rate limits are applied per tier:

- **Free**: 100 requests/hour, 1,000 requests/day
- **Power**: 1,000 requests/hour, 10,000 requests/day
- **Premium**: 10,000 requests/hour, 100,000 requests/day

Limits are tracked per:

- IP address
- User ID (if authenticated)
- Endpoint
- Time period (hourly/daily)

## Environment Variables

```bash
PORT=3000
JWT_SECRET=your-secret-key
AUTH_SERVICE_URL=http://patriotchat-auth:4001
CORS_ORIGIN=http://localhost:4200
```

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm start

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm start
```
