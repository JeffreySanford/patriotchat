# API E2E Tests

Comprehensive Playwright end-to-end test suite for the PatriotChat API.

## Overview

This directory contains organized Playwright E2E tests covering:

- **Critical Requirements**: 5 core system requirements with full validation
- **Workflows**: Complete user journeys and cross-service integration
- **Performance**: Service latency benchmarks and throughput metrics

## Structure

```
src/
├── critical-requirements/
│   ├── performance.spec.ts          # Auth < 100ms requirement
│   ├── audit-trail.spec.ts          # PostgreSQL logging
│   ├── database.spec.ts             # Connection pooling
│   ├── llm-selector.spec.ts         # Model availability
│   └── rate-limiting.spec.ts        # 4-dimensional guards
├── workflows/
│   └── user-journey.spec.ts         # E2E user flows
├── performance/
│   └── service-latency.spec.ts      # Service benchmarks
└── support/
    ├── api-client.ts                # API utilities
    └── test-data.ts                 # Test generators
```

## Running Tests

### Local Development

```bash
# Run all tests (headless)
pnpm nx test api-e2e

# Run with UI (headed)
pnpm nx test api-e2e --configuration=headed

# Debug mode
pnpm nx test api-e2e --configuration=debug

# Run specific file
pnpm nx test api-e2e -- --grep "Performance"

# Watch mode
pnpm nx test api-e2e -- --watch
```

### CI/CD

Tests run automatically on:
- Push to `main`, `develop`, or feature branches
- Pull requests to `main` or `develop`

Configuration: `.github/workflows/ci.yml`

## Requirements

- Node.js 20+
- pnpm 10+
- All API services running on their configured ports:
  - API Gateway: `http://localhost:3000`
  - Auth Service: `http://localhost:4001`
  - Funding Service: `http://localhost:4002`
  - Policy Service: `http://localhost:4003`
  - LLM Service: `http://localhost:4004`
  - Analytics Service: `http://localhost:4005`
  - PostgreSQL: `postgresql://localhost:5432`
  - Ollama: `http://localhost:11434`

## Starting Services

```bash
# Start all services
pnpm run start:all

# Or run Docker services + backend
pnpm run start:deps
pnpm run start
```

## Test Coverage

### Critical Requirements (5/5)
- ✅ **Performance**: All services respond in < 100ms
- ✅ **Audit Trail**: PostgreSQL immutable logging
- ✅ **Database**: Connection pooling, concurrent requests
- ✅ **LLM Selector**: Multi-model support
- ✅ **Rate Limiting**: 4-dimensional guards

### E2E Workflows
- User registration & login flows
- Multi-query sessions
- Cross-service integration
- Error handling & recovery

### Performance Metrics
- Service latency benchmarks
- Concurrent request handling
- Database query performance
- Throughput measurements

## Test Results

Results are saved to `test-results/`:
- HTML report: `index.html`
- JUnit XML: `junit.xml`
- JSON: `results.json`

View the HTML report:
```bash
pnpm exec playwright show-report test-results
```

## Configuration

### Playwright Config
[playwright.config.ts](./playwright.config.ts) - Timeout, reporters, browsers

### Nx Project Config
[project.json](./project.json) - Build targets, configurations

### TypeScript Config
[tsconfig.json](./tsconfig.json) - Compiler options

## Support Files

### API Client (`support/api-client.ts`)
- `apiRequest()` - Route to correct service
- `measureLatency()` - Performance tracking
- `registerTestUser()` - User helper
- `loginUser()` - Auth helper

### Test Data (`support/test-data.ts`)
- `generateTestUser()` - Unique user generation
- `generateTestQuery()` - Query generation
- `TEST_DATA` - Constants

## CI/CD Integration

### GitHub Actions Workflows

**E2E Tests**: `.github/workflows/e2e-ci.yml`
- Runs on all branches
- Installs Playwright
- Starts services
- Runs full suite
- Uploads artifacts

**Unit Tests**: `.github/workflows/unit-tests.yml`
- Runs Jest/Vitest
- Multiple Node versions
- Code coverage

**Full Pipeline**: `.github/workflows/ci.yml`
- Quality gates
- Build
- Unit tests
- E2E tests
- Summary report

## Troubleshooting

### Tests fail with "Connection refused"
- Ensure all services are running: `docker-compose ps`
- Check service health: `curl http://localhost:3000/health`

### Playwright browsers not installed
```bash
pnpm exec playwright install --with-deps
```

### CI tests failing but local passing
- Check environment variables in GitHub Actions
- Verify service ports match CI configuration
- Check CI logs for service startup errors

## Best Practices

1. **Use test data helpers**: `generateTestUser()`, `generateTestQuery()`
2. **Organize by feature**: Group related tests in test suites
3. **Share support functions**: Use `api-client.ts` utilities
4. **Measure performance**: Use `measureLatency()` for benchmarks
5. **Clean assertions**: One assertion per test when possible
6. **Meaningful names**: Test names should describe expected behavior

## Contributing

When adding new tests:

1. Place in appropriate directory (critical-requirements, workflows, or performance)
2. Use existing support utilities
3. Add descriptive test names
4. Include console.log for key assertions
5. Update this README with new coverage areas

## Links

- [Playwright Documentation](https://playwright.dev)
- [Nx Playwright Plugin](https://nx.dev/plugins/official/plugin-playwright)
- [PatriotChat Architecture](../../documentation/ARCHITECTURE.md)
- [Critical Requirements](../../REQUIREMENTS_VERIFICATION.md)
