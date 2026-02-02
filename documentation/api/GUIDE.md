# API Endpoint Testing Guide

This guide explains how to test all PatriotChat API endpoints.

## Available Endpoints

### 1. GET /api

**Description:** Root API endpoint that returns a welcome message.

**Response:**

```json
{
  "message": "Hello API"
}
```

**Curl Example:**

```bash
curl http://localhost:3000/api
```

---

### 2. GET /api/status

**Description:** Returns system status and health metrics.

**Response:**

```json
{
  "revision": "string",
  "uptimeMs": 12345,
  "activeModel": "llama-2",
  "guardrailPassRate": 98.5,
  "indicators": [
    {
      "label": "API Health",
      "detail": "All systems operational",
      "state": "healthy"
    },
    {
      "label": "LLM Service",
      "detail": "Connected to llama-2",
      "state": "healthy"
    },
    {
      "label": "Cache",
      "detail": "Cache operational",
      "state": "healthy"
    }
  ]
}
```

**Curl Example:**

```bash
curl http://localhost:3000/api/status
```

---

### 3. POST /api/query

**Description:** Submit a prompt to the LLM and get a response.

**Request Body:**

```json
{
  "prompt": "Your question or prompt here"
}
```

**Response:**

```json
{
  "response": "The LLM response text",
  "latencyMs": 1234
}
```

**Curl Example:**

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is 2+2?"}'
```

---

## Testing Methods

### Method 1: Using Node.js Test Script

Simple and cross-platform, works on Windows/Mac/Linux.

```bash
# Test all endpoints
pnpm run test:api:endpoints

# Or directly with node
node test-api-endpoints.js

# Or with custom API URL
API_URL=http://localhost:3000 node test-api-endpoints.js
```

### Method 2: Using PowerShell Script

Optimized for Windows, colorful output.

```powershell
# Run the test script
./test-api-endpoints.ps1

# Or with custom API URL
./test-api-endpoints.ps1 -ApiUrl "http://localhost:3000"
```

### Method 3: Using Bash Script

Optimized for Unix/Linux/Mac.

```bash
# Run the test script
bash test-api-endpoints.sh

# Or with custom API URL
API_URL=http://localhost:3000 bash test-api-endpoints.sh
```

### Method 4: Using Jest/E2E Tests

Comprehensive e2e tests with full assertions.

```bash
# Run e2e tests (requires API server running)
pnpm run test:api:e2e

# Or with Nx directly
pnpm nx run api-e2e:e2e

# Or with npm test
npm test api-e2e
```

### Method 5: Manual Curl Commands

Individual endpoint testing.

```bash
# 1. Test root endpoint
curl -X GET http://localhost:3000/api

# 2. Test status endpoint
curl -X GET http://localhost:3000/api/status

# 3. Test query endpoint
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test prompt"}'

# 4. Test error cases
curl -X GET http://localhost:3000/api/nonexistent
curl -X POST http://localhost:3000/api/query -d '{}'

# 5. Test CORS with OPTIONS
curl -X OPTIONS http://localhost:3000/api
```

---

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- npm or pnpm
- curl (for manual testing)
- API server running on `http://localhost:3000`

### Build and Start API

```bash
# Build all projects
pnpm run build

# Start API server in one terminal
pnpm run start:api

# Or start full stack in another terminal
pnpm run start:all
```

### Run Tests

In a separate terminal, run your preferred test method:

```bash
# Option 1: Quick API endpoint tests
pnpm run test:api:endpoints

# Option 2: Full e2e tests
pnpm run test:api:e2e

# Option 3: Manual curl testing
curl http://localhost:3000/api
```

---

## Test Coverage

The test suites validate:

✅ **Functionality**

- Correct HTTP status codes
- Proper response structures
- Data types and values
- Error handling

✅ **Performance**

- Response times < 5 seconds
- Status endpoint availability
- Query endpoint responsiveness

✅ **Standards**

- CORS headers
- Content-Type headers
- JSON formatting
- HTTP method support

✅ **Error Cases**

- Missing required fields
- Invalid JSON
- Non-existent endpoints
- Malformed requests

✅ **API Contract**

- Consistent response structures
- Stable data formats
- Predictable behavior

---

## Environment Variables

```bash
# Custom API URL (default: http://localhost:3000)
API_URL=http://custom-api-url:3000

# Run with custom URL
API_URL=http://api.example.com node test-api-endpoints.js
```

---

## Troubleshooting

### "Connection refused" Error

- Ensure API server is running: `pnpm run start:api`
- Check port 3000 is not in use: `lsof -i :3000`

### Tests fail with 404

- Verify API is built: `pnpm run build`
- Check global prefix setting in `api/src/main.ts`

### CORS errors in browser

- Ensure CORS is enabled in `api/src/main.ts`
- Check frontend URL is in allowed origins list

### Response timeout

- Increase test timeout in test files
- Check backend service dependencies (LLM, heavy service)

---

## Test Files Location

- **E2E Tests:** `api-e2e/src/api/endpoints.spec.ts`
- **Node.js Script:** `test-api-endpoints.js`
- **PowerShell Script:** `test-api-endpoints.ps1`
- **Bash Script:** `test-api-endpoints.sh`
