# Model Switching and Inference Query Testing

## Overview

A comprehensive E2E test suite has been created to validate model switching functionality and inference queries across all available models in PatriotChat.

**File**: `apps/api-e2e/src/workflows/model-switching.spec.ts`

## Test Coverage

### 1. **Model Availability and Switching** (3 tests)

- Retrieves list of 4+ available models
- Validates model properties (id, name, description, provider)
- Confirms all expected models present: llama2, mistral, neural-chat

### 2. **Single Model Query Execution** (3 tests)

- Execute queries independently with each model:
  - llama2: Constitutional principles
  - mistral: Government structure
  - neural-chat: Economic concepts
- Validates response structure and content

### 3. **Model Switching with Sequential Queries** (2 tests)

- Switch between all 4 models dynamically and execute queries
- Verify model state persists across consecutive requests
- Each request includes assertions on model consistency

### 4. **Model-Specific Response Validation** (2 tests)

- Returns valid response structure from each model
- Includes model identification in response
- Validates timestamp and response content

### 5. **Error Handling and Edge Cases** (3 tests)

- Invalid model selection returns appropriate error
- Empty prompt rejected gracefully
- Missing model field validation

### 6. **Performance with Model Switching** (1 test)

- Rapid model switches measured for performance
- Validates queries complete under acceptable timeframes

### 7. **Integration: Frontend Model Selector Scenario** (2 tests)

- **Full workflow test**:
  1. Load models from API
  2. Select model from UI
  3. Submit query with selected model
  4. Switch to different model
  5. Submit query with new model
  6. Verify both queries succeed

- **Model persistence test**:
  - User selects model and makes 3 consecutive queries
  - Validates same model used throughout interaction

## Key Features

### Strong Type Safety

- All model arrays validated with `Array.isArray()` checks
- Type assertions (`as string`, `as any[]`) ensure proper typing
- Guard clauses prevent null/undefined access
- Response properties properly typed and validated

### Civic-Focused Test Data

- Questions target constitutional principles
- Prompts cover government structure, separation of powers
- Contexts include: civics, government, economics, constitutional law

### Comprehensive Validation

- API response validation at every step
- Model identification verification
- Response content length validation
- State consistency across requests

### Real-World Scenarios

- Simulates actual user workflow: load → select → query → switch → query
- Tests rapid model switching
- Validates model persistence across multiple queries

## Test Execution

Run the model switching tests:

```bash
pnpm nx run api-e2e:e2e -- --grep "Model Switching and Multi-Model Queries"
```

Run specific test suites:

```bash
# Model availability only
pnpm nx run api-e2e:e2e -- --grep "Model Availability and Switching"

# Frontend scenario only
pnpm nx run api-e2e:e2e -- --grep "Integration: Frontend Model Selector Scenario"
```

## Dependencies

The test suite depends on:

- **Playwright Test**: E2E test framework
- **API Client**: `support/api-client.ts` for HTTP requests
- **Test Data**: `support/test-data.ts` for constants
- **Running Services**: API Gateway, LLM service (Ollama), Auth service

## Expected Results

When all services are running:

- ✓ All 4+ models available
- ✓ Each model accepts queries and returns responses
- ✓ Model switching works seamlessly
- ✓ Model state persists correctly
- ✓ Response validation passes for all models
- ✓ Error handling works as expected
- ✓ Performance targets met

## Integration with CI/CD

These tests can be added to Nx CI pipeline in `nx.json`:

```json
{
  "target": "e2e-ci--src/workflows/model-switching.spec.ts",
  "projects": "self",
  "command": "playwright test src/workflows/model-switching.spec.ts"
}
```

## Architecture Tested

```text
Frontend (Angular)
    ↓
[Model Selector Dropdown] ← getModels() API
    ↓
[Select Model & Enter Query]
    ↓
[Generate Button]
    ↓
API Gateway (NestJS:3000)
    ↓
LLM Service (Go:4004)
    ↓
Ollama (11434)
    ↓
Model Inference (llama2, mistral, neural-chat)
    ↓
Response → API Gateway → Frontend
```

## Type Safety Improvements

All TypeScript errors have been resolved with:

1. **Array validation**: `Array.isArray()` guards before accessing `.length` or `.map()`
2. **Type assertions**: Explicit casting of union types to specific types
3. **Guard clauses**: Throwing errors if critical validations fail
4. **Property validation**: Checking for property existence before access

This ensures the test suite is fully type-safe and production-ready.
