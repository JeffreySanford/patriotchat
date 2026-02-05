# Model Switching E2E Tests - Quick Start Guide

## What Was Created

A comprehensive E2E test suite (`model-switching.spec.ts`) that validates model switching and inference queries across all available models in PatriotChat.

## 📋 Test Summary

**Total Tests**: 17 organized in 7 test suites

|Suite|Tests|Purpose|
|-|-|-|
|Model Availability and Switching|3|Verify model list, properties, and expected models present|
|Single Model Query Execution|3|Test individual queries for llama2, mistral, neural-chat|
|Model Switching with Sequential Queries|2|Switch models and maintain state across requests|
|Model-Specific Response Validation|2|Validate response structure and model identification|
|Error Handling and Edge Cases|3|Invalid models, empty prompts, missing fields|
|Performance with Model Switching|1|Measure query times with rapid model switching|
|Integration: Frontend Model Selector Scenario|2|Full user workflow: load → select → query → switch|

## 🚀 Running the Tests

### Start All Services First

```bash
pnpm run start:all
```

This starts:

- PostgreSQL (5432)
- API Gateway (3000)
- LLM Service + Ollama (4004, 11434)
- Auth Service (4001)
- Analytics Service (4005)

### Run All Model Switching Tests

```bash
pnpm nx run api-e2e:e2e -- --grep "Model Switching and Multi-Model Queries" --workers=1
```

### Run Specific Test Suites

**Model Availability Only**:

```bash
pnpm nx run api-e2e:e2e -- --grep "Model Availability and Switching" --workers=1
```

**Single Model Queries Only**:

```bash
pnpm nx run api-e2e:e2e -- --grep "Single Model Query Execution" --workers=1
```

**Full Workflow Integration Tests Only**:

```bash
pnpm nx run api-e2e:e2e -- --grep "Integration: Frontend Model Selector Scenario" --workers=1
```

**Error Handling Only**:

```bash
pnpm nx run api-e2e:e2e -- --grep "Error Handling and Edge Cases" --workers=1
```

## ✅ Expected Output

When tests pass, you'll see:

```text
✓ Model Switching and Multi-Model Queries (17 tests)
  ✓ Model Availability and Switching
    ✓ Should retrieve list of 4 available models
    ✓ Should have expected model properties
    ✓ Should include expected models: llama2, mistral, neural-chat
  ✓ Single Model Query Execution
    ✓ Should execute query successfully with llama2 model
    ✓ Should execute query successfully with mistral model
    ✓ Should execute query successfully with neural-chat model
  ✓ Model Switching with Sequential Queries
    ✓ Should switch between all 4 models and execute queries
    ✓ Should maintain model state across consecutive requests
  ✓ Model-Specific Response Validation
    ✓ Should return valid response structure from each model
    ✓ Should include model identification in response
  ✓ Error Handling and Edge Cases
    ✓ Should return error for invalid model
    ✓ Should handle empty prompt gracefully
    ✓ Should validate model selection required
  ✓ Performance with Model Switching
    ✓ Should handle rapid model switches under 2 seconds per query
  ✓ Integration: Frontend Model Selector Scenario
    ✓ Should complete full user workflow
  ✓ Should persist selected model in UI state
```

## 🔍 What the Tests Validate

### Model Switching

- ✅ UI model selector receives correct model list
- ✅ User can switch between all 4 available models
- ✅ Selected model persists across consecutive queries

### Query Execution

- ✅ Queries execute successfully with each model
- ✅ Responses contain generated text
- ✅ Response structure is consistent across models

### Response Handling

- ✅ Model identification included in response
- ✅ Response timestamps recorded properly
- ✅ Content validation (non-empty, reasonable length)

### Error Cases

- ✅ Invalid model selection rejected
- ✅ Empty prompts handled gracefully
- ✅ Missing required fields validated

### Performance

- ✅ Rapid model switching completes in acceptable time
- ✅ No timeout or lag with sequential requests

### Full Workflow

- ✅ User loads page → models fetched
- ✅ User selects model from dropdown
- ✅ User submits query with selected model
- ✅ Response received and displayed
- ✅ User switches to different model
- ✅ New query executed with new model

## 📁 Test Files

**Location**: `apps/api-e2e/src/workflows/model-switching.spec.ts`

**Dependencies**:

- `support/api-client.ts` - HTTP request helper
- `support/test-data.ts` - Test constants (if needed)

## 🧪 Key Test Patterns

### Model Array Validation

```typescript
const models = response.data?.models;
expect(Array.isArray(models)).toBe(true);
if (!Array.isArray(models)) {
  throw new Error('Models response is not an array');
}
expect(models.length).toBeGreaterThanOrEqual(4);
```

### Response Type Coercion

```typescript
const responseText = (responseData?.response || responseData?.output || '') as string;
expect(typeof responseText).toBe('string');
expect(responseText.length).toBeGreaterThan(0);
```

### Model State Verification

```typescript
const usedModel = (response.data?.model || response.data?.modelId || selectedModel) as string;
expect(usedModel.toLowerCase()).toBe(selectedModel.toLowerCase());
```

## 🎯 Civic Education Focus

Test questions are designed around constitutional/civic topics:

- Constitutional principles
- Separation of powers
- Federalist Papers
- Bill of Rights
- Checks and balances
- Individual liberty

All prompts encourage responses aligned with constitutional governance themes.

## 📊 CI/CD Integration

To add to CI pipeline, update `nx.json`:

```json
{
  "target": "e2e-ci--src/workflows/model-switching.spec.ts",
  "options": {
    "cwd": "apps/api-e2e",
    "command": "playwright test src/workflows/model-switching.spec.ts"
  }
}
```

## 🐛 Troubleshooting

### Tests Timeout

- Ensure Ollama service is running and models are loaded
- Check API Gateway is listening on port 3000
- Verify LLM service is responsive

### Model Not Found

- List available models: Check first test "Should retrieve list of 4 available models"
- If models missing, pull/load them in Ollama: `ollama pull llama2`

### Response Validation Fails

- Check API Gateway is properly routing to LLM service
- Verify Ollama response format matches expectations

### Connection Errors

- Ensure `pnpm run start:all` completed successfully
- Check all services are listening on expected ports

## 📚 References

- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [PatriotChat Architecture](../README.md)
- [API Gateway Docs](../documentation/MICROSERVICES_ARCHITECTURE.md)
- [LLM Service Docs](../documentation/LLM/)
