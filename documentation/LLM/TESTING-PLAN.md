# LLM Testing Plan

This plan outlines testing strategies for the CEA LLM to ensure quality, safety, and alignment.

## Unit Testing

- **Scope**: Individual components (data processing, model loading).
- **Tools**: Jest for TS, Go testing for backend.
- **Criteria**: Code coverage 80%+, no regressions.

## Integration Testing

- **Scope**: End-to-end flows (query → response).
- **Tools**: Playwright for UI, API tests for backend.
- **Criteria**: All DTOs validate, responses within latency limits.

## Model Evaluation

- **Scope**: Use evaluation checklist for bias, steelman, sources.
- **Tools**: Custom harness (Go/TS scripts).
- **Criteria**: Pass 80% of tests, no high-severity biases.

## Performance Testing

- **Scope**: Load testing with concurrent queries.
- **Tools**: Artillery or similar.
- **Criteria**: <2s response time, stable under load.

## Security Testing

- **Scope**: Injection attacks, data leakage.
- **Tools**: OWASP ZAP, manual reviews.
- **Criteria**: No vulnerabilities, guardrails block harmful prompts.

## User Acceptance Testing

- **Scope**: Beta users test civic reasoning scenarios.
- **Tools**: Feedback forms, surveys.
- **Criteria**: 90% satisfaction, actionable insights.

## Regression Testing

- **Scope**: Re-run all tests after changes.
- **Tools**: CI pipeline.
- **Criteria**: All tests pass.

## Schedule

- Daily: Unit/integration.
- Weekly: Model evaluation.
- Monthly: Full suite + UAT.

## Reporting

- Test results in CI, summaries in governance log.
