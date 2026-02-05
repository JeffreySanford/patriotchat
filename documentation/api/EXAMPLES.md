# API Endpoint Testing - Sample Test Run

## Expected Output When Tests Pass

### Running the Node.js Test Script

```bash
$ pnpm run test:api:endpoints

> @patriotchat/source@0.0.0 test:api:endpoints
> node test-api-endpoints.js

================================================
PatriotChat API Endpoint Testing (Node.js)
================================================
Base URL: http://localhost:3000/api
Timestamp: 2026-02-02T20:15:30.123Z

================================================
1. ROOT ENDPOINT TESTS
================================================

Testing: GET /api - Root endpoint
  Method: GET
  Endpoint: /api
  Status: 200
  ✓ PASS
  Response:
    {
      "message": "Hello API"
    }

================================================
2. STATUS ENDPOINT TESTS
================================================

Testing: GET /api/status - System status
  Method: GET
  Endpoint: /api/status
  Status: 200
  ✓ PASS
  Response:
    {
      "revision": "v1.0.0",
      "uptimeMs": 45231,
      "activeModel": "llama-2-7b",
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

================================================
3. QUERY ENDPOINT TESTS
================================================

Testing: POST /api/query - Basic query
  Method: POST
  Endpoint: /api/query
  Data: {"prompt":"What is 2+2?"}
  Status: 200
  ✓ PASS
  Response:
    {
      "response": "2+2 equals 4. This is a basic arithmetic operation where two numbers are added together.",
      "latencyMs": 1234
    }

Testing: POST /api/query - Test prompt
  Method: POST
  Endpoint: /api/query
  Data: {"prompt":"test prompt"}
  Status: 200
  ✓ PASS
  Response:
    {
      "response": "This is a test prompt response.",
      "latencyMs": 567
    }

================================================
4. ERROR HANDLING TESTS
================================================

Testing: POST /api/query - Missing prompt field
  Method: POST
  Endpoint: /api/query
  Data: {}
  Status: 400
  ✓ PASS
  Status Code: 400

Testing: GET /api/nonexistent - Non-existent endpoint
  Method: GET
  Endpoint: /api/nonexistent
  Status: 404
  ✓ PASS
  Status Code: 404

================================================
5. CORS AND METHOD TESTS
================================================

Testing: OPTIONS /api - CORS preflight request
  Method: OPTIONS
  Endpoint: /api
  Status: 200
  ✓ PASS
  Status Code: 200

================================================
TEST SUMMARY
================================================
Passed: 8
Failed: 0
Total: 8

✓ All tests passed!
```

## Running E2E Tests

### Command

```bash
pnpm run test:api:e2e
```

### Expected Output

```dos
> @patriotchat/source@0.0.0 test:api:e2e
> pnpm nx run api-e2e:e2e

> nx run api-e2e:e2e

Setting up...

 PASS   api-e2e  api-e2e/src/api/endpoints.spec.ts
  API Endpoints - Complete Test Suite
    GET /api
      ✓ should return a message (12 ms)
      ✓ should have correct content-type (8 ms)
      ✓ should respond without authentication (7 ms)
    GET /api/status
      ✓ should return status metrics (10 ms)
      ✓ should return status with all required fields (9 ms)
      ✓ should return status indicators with correct structure (8 ms)
      ✓ should return numeric values for uptimeMs and guardrailPassRate (7 ms)
    POST /api/query
      ✓ should accept a query prompt (25 ms)
      ✓ should return response with latency (23 ms)
      ✓ should handle various prompt types (45 ms)
      ✓ should reject empty prompt (18 ms)
      ✓ should handle request with correct content-type (22 ms)
      ✓ should return response with valid structure (28 ms)
    Error Handling
      ✓ should handle 404 for non-existent endpoint (12 ms)
      ✓ should handle malformed JSON in POST body (14 ms)
      ✓ should handle missing required fields (15 ms)
    CORS and Headers
      ✓ should include CORS headers in response (8 ms)
      ✓ should handle OPTIONS requests (9 ms)
    Response Times
      ✓ should respond to status endpoint within reasonable time (11 ms)
      ✓ should respond to root endpoint within reasonable time (9 ms)
    API Contract
      ✓ should maintain consistent response structure for status (15 ms)
      ✓ should return consistent message from root endpoint (12 ms)

Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
Snapshots:   0 total
Time:        2.345s

 NX   Successfully ran target e2e for project api-e2e
```

## Manual curl Test Run

### Commands and Expected Responses

```bash
# 1. Test root endpoint
$ curl http://localhost:3000/api
{"message":"Hello API"}

# 2. Test status endpoint
$ curl http://localhost:3000/api/status
{
  "revision":"v1.0.0",
  "uptimeMs":45231,
  "activeModel":"llama-2-7b",
  "guardrailPassRate":98.5,
  "indicators":[
    {"label":"API Health","detail":"All systems operational","state":"healthy"},
    {"label":"LLM Service","detail":"Connected to llama-2","state":"healthy"},
    {"label":"Cache","detail":"Cache operational","state":"healthy"}
  ]
}

# 3. Test query endpoint
$ curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is an API?"}'
{
  "response":"An API (Application Programming Interface) is a set of rules and protocols for building software applications that specify how software components should interact.",
  "latencyMs":1234
}

# 4. Test error case
$ curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{}'
# Returns 400 Bad Request

# 5. Test non-existent endpoint
$ curl http://localhost:3000/api/nonexistent
# Returns 404 Not Found
```

## Troubleshooting Failed Tests

### If You See "Connection refused"

```bash
# Check if API is running
pnpm run start:api

# Verify port 3000 is listening
netstat -ano | grep :3000
```

### If You See "404 Not Found"

```bash
# Rebuild the API
pnpm run build

# Check route configuration
grep -r "setGlobalPrefix" api/src/main.ts
```

### If Tests Timeout

```bash
# Check if dependencies are running
docker ps  # Check for ollama, heavy service

# Increase test timeout in test files if needed
# Look for "timeout" configuration in jest.config.ts
```

## Performance Expectations

- **GET /api:** < 10ms
- **GET /api/status:** < 50ms
- **POST /api/query:** 500ms - 5 seconds (depending on LLM)
- **All endpoints:** < 5 seconds for test script to complete

## Test Statistics

| Metric            | Value |
| ----------------- | ----- |
| Total Tests       | 22+   |
| Endpoints Tested  | 3     |
| Error Scenarios   | 3     |
| CORS Tests        | 2     |
| Performance Tests | 2     |
| Contract Tests    | 2     |
| Pass Rate Target  | 100%  |

## Next Steps After Successful Tests

1. ✅ API is functioning correctly
2. ✅ All endpoints responding
3. ✅ Error handling working
4. ✅ CORS configured properly
5. ✅ Performance acceptable

**You can now:**

- Deploy the API to production
- Integrate with frontend
- Set up monitoring
- Add additional test cases
