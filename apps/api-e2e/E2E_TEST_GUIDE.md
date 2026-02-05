# E2E Test Suite Documentation

## Overview

This E2E test suite provides comprehensive integration testing for the PatriotChat microservices architecture. The tests validate critical system requirements, user workflows, resilience patterns, and telemetry pipelines.

## Test Organization

### Critical Requirements Tests (`critical-requirements/`)

- **audit-trail.spec.ts** - Immutable audit logging functionality
- **database.spec.ts** - PostgreSQL connection pooling and data persistence
- **llm-selector.spec.ts** - LLM model selection and execution
- **performance.spec.ts** - Service latency and performance baselines
- **rate-limiting.spec.ts** - 4-dimensional rate limiting protection

### E2E Workflows (`workflows/`)

- **user-journey.spec.ts** - Complete user registration, login, and inference workflows
- **resilience-and-recovery.spec.ts** - Error recovery, timeouts, data consistency, service failure isolation, session management (20 tests)
- **telemetry-validation.spec.ts** - Event telemetry pipeline, data quality, WebSocket stability, end-to-end message flow (16 tests)

### Performance Tests (`performance/`)

- **service-latency.spec.ts** - Service latency benchmarks and throughput testing

## Infrastructure Requirements

The E2E tests are **integration tests** that require the following services to be running:

| Service           | Port | Health Endpoint     |
| ----------------- | ---- | ------------------- |
| API Gateway       | 3000 | `/health`           |
| Auth Service      | 4001 | `/auth/health`      |
| Funding Service   | 4002 | `/funding/health`   |
| Policy Service    | 4003 | `/policy/health`    |
| LLM Service       | 4004 | `/inference/health` |
| Analytics Service | 4005 | `/analytics/health` |

### Starting Services

```bash
# Using Docker Compose
docker-compose up -d

# Verify services are running
curl http://localhost:3000/health
curl http://localhost:4001/auth/health
```

## Running Tests

### All E2E Tests

```bash
nx test api-e2e
```

### Specific Test File

```bash
nx test api-e2e --testFile=critical-requirements/performance.spec.ts
```

### Headed Mode (Visual)

```bash
nx test api-e2e --headed
```

### Debug Mode

```bash
nx test api-e2e --debug
```

### CI Configuration

```bash
nx test api-e2e --configuration=ci
```

## Test Diagnostics

The test suite automatically checks service health before running tests and provides diagnostic output:

```bash
=== E2E Test Suite Global Setup ===

Service Status:
  ✓ HEALTHY: gateway (15ms)
  ✓ HEALTHY: auth (12ms)
  ✓ HEALTHY: funding (14ms)
  ✓ HEALTHY: policy (13ms)
  ✓ HEALTHY: llm (16ms)
  ✓ HEALTHY: analytics (15ms)

Overall: 6/6 services healthy
✓ Service infrastructure is ready for testing
```

If services are unavailable, the tests will fail with detailed error information. Each test failure will indicate which API endpoint was unresponsive.

## Test Coverage

### New E2E Hardening Tests (36 tests)

#### Resilience & Error Recovery (20 tests)

1. **Error Handling & Recovery (4 tests)**
   - Invalid login attempt recovery
   - Duplicate registration handling
   - Invalid token validation
   - Malformed request bodies

2. **Timeout & Performance Handling (3 tests)**
   - Inference request timeout windows
   - Concurrent inference request handling
   - Request rate limiting

3. **Data Consistency (2 tests)**
   - Consistent user data across auth and analytics services
   - Inference request context tracking

4. **Failure Isolation (2 tests)**
   - System behavior when non-critical services are slow
   - Graceful degradation when LLM service is unavailable

5. **Session & Token Management (2 tests)**
   - Session maintenance across multiple requests
   - Token reuse prevention after expiration

6. **Additional Edge Cases (7 tests)**
   - Cross-service data consistency
   - Service graceful degradation
   - Concurrent request handling
   - Rate limiting enforcement
   - Token lifecycle management

#### Telemetry & WebSocket Validation (16 tests)

1. **Event Telemetry Pipeline (5 tests)**
   - User registration event capture
   - Authentication event capture
   - Inference execution event capture
   - Event batching efficiency
   - Invalid telemetry event handling

2. **Telemetry Data Quality (3 tests)**
   - Required telemetry field validation
   - Event correlation with user sessions
   - Invalid event graceful handling

3. **Telemetry Performance (2 tests)**
   - Non-blocking telemetry collection
   - High-volume analytics event handling

4. **WebSocket Stability (4 tests)**
   - Health status endpoint maintenance
   - Ready status reporting with dependencies
   - Telemetry service connection handling
   - Consistent health metrics

5. **End-to-End Message Flow (1 test)**
   - Complete event pipeline validation

6. **Integration Tests (1 test)**
   - Full pipeline event flow validation

## API Response Handling

The test suite includes robust API client error handling:

- **Retry Logic**: Automatic exponential backoff on failure (up to 3 retries)
- **Timeout**: 5-second timeout per request
- **Response Parsing**: Handles both JSON and non-JSON responses gracefully
- **Token Management**: Automatic Bearer token injection for authenticated requests

## Test Data Generation

Tests use randomized data generation to ensure test isolation:

```typescript
// Generates unique test user with timestamp
const testUser = generateTestUser();
// Example: { username: 'testuser_1234567890', email: 'testuser_1234567890@test.patriotchat.com', password: 'Test@Pass1234' }

// Generates unique test query
const testQuery = generateTestQuery();
// Example: { query: 'What is the meaning of life? [uuid]' }
```

## Common Failure Causes

| Symptom           | Cause                             | Solution                                     |
| ----------------- | --------------------------------- | -------------------------------------------- |
| All tests fail    | Services not running              | Run `docker-compose up -d`                   |
| Some tests pass   | Partial service availability      | Check service logs: `docker-compose logs -f` |
| Timeout errors    | Services slow to respond          | Increase timeout in `api-client.ts`          |
| Auth failures     | Missing database setup            | Run database migrations                      |
| Telemetry missing | Analytics service not initialized | Check analytics service startup logs         |

## Debugging

### View Service Logs

```bash
docker-compose logs -f [service-name]
# Example: docker-compose logs -f auth
```

### Run Single Test in Debug Mode

```bash
nx test api-e2e --debug --testFile=workflows/user-journey.spec.ts
```

### View Test Report

```bash
# After running tests
open test-results/index.html  # macOS
start test-results/index.html # Windows
```

## Configuration

### Environment Variables

Set in `.env` or pass to test command:

```bash
GATEWAY_URL=http://localhost:3000
AUTH_URL=http://localhost:4001
FUNDING_URL=http://localhost:4002
POLICY_URL=http://localhost:4003
LLM_URL=http://localhost:4004
ANALYTICS_URL=http://localhost:4005
BASE_URL=http://localhost:3000
```

### Playwright Configuration

Edit `playwright.config.ts` to modify:

- Browser projects (chromium, firefox, webkit)
- Parallel workers
- Retries for CI
- Report output formats

## Continuous Integration

Tests are configured to run in CI with:

- Single worker (no parallelization)
- Automatic retries on failure
- Trace collection on first retry
- HTML report generation

```bash
nx test api-e2e --configuration=ci
```

## Performance Benchmarks

The test suite collects performance metrics:

- **Service Latency**: Average response times for each service
- **Database Query Performance**: Query execution times
- **Throughput**: Concurrent request handling capacity
- **Event Batching**: Telemetry event batching efficiency

Results are available in test output and HTML reports.

## Accessibility & Standards

All tests follow:

- TypeScript strict mode
- ESLint conventions
- Playwright best practices
- Async/await patterns for all async operations

## Contributing

When adding new E2E tests:

1. Follow the existing directory structure
2. Use `generateTestUser()` and `generateTestQuery()` for data
3. Include proper error handling and assertions
4. Document test purpose in describe block
5. Add console logs for debugging
6. Test for both success and failure paths

Example:

```typescript
test.describe('Feature Name', () => {
  test('Should accomplish specific goal', async () => {
    const testData = generateTestUser();

    // Act
    const response = await apiRequest({
      method: 'POST',
      endpoint: '/endpoint',
      service: 'serviceName',
      body: {
        /* ... */
      },
    });

    // Assert
    expect(response.ok).toBe(true);
    console.log('✓ Feature validated');
  });
});
```

## Related Documentation

- [API Endpoints Registry](../documentation/api/ENDPOINTS_SUMMARY.md)
- [Error Handling Guide](../documentation/error-handling/INDEX.md)
- [Database Schema](../documentation/DATABASE_SCHEMA.md)
- [Microservices Architecture](../documentation/MICROSERVICES_ARCHITECTURE.md)
- [Debugging Guide](../documentation/debug/DEBUGGING_QUICK_START.md)
