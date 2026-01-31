# PatriotChat Metrics & Observability

## Purpose

Share measurable KPIs so every guardrail, DTO contract, and inference path remains auditable. These metrics feed dashboards (Prometheus, Grafana, or similar) and trigger alerts when actionable thresholds are crossed.

## Primary KPIs

1. **Inference latency (ms)**
   - Source: Go/Ollama proxy timing instrumentation.
   - Target: [TBD] base percentiles (p50 < 250ms, p95 < 600ms)
   - Alert when 1-minute rolling p95 > 1s for > 5 minutes.
2. **Guardrail pass rate (%)**
   - Source: Validation/keyword filters executed in the Go service.
   - Target: ≥ 99.5% of prompts should pass without manual override; exceptions logged.
   - Alert if guardrail failures increase > 2x baseline or exceed 0.5% of queries.
3. **Hallucination/failure rate (%)**
   - Source: end-to-end tests plus production self-check heuristics (e.g., unmatched facts, citation mismatches).
   - Alert if failure rate > 1% for two consecutive hours.
4. **Query cost ($)**
   - Source: compute/GPU usage tied to Ollama inference sessions.
   - Monitor spend per day/week and alert if daily burn is >30% above plan.
5. **End-to-end test pass rate (%)**
   - Source: CI pipeline (`pnpm nx e2e frontend-e2e` and guardrail regression suites).
   - Target full pass on every merge; fail fast on regressions.
6. **Metadata coverage (%)**
   - Source: governance log entries with dataset license, owner, version, guardrail tag.
   - Target 100% coverage before a dataset/model goes live.

## Monitoring & Alerts

- Push latency, guardrail, hallucination, and cost metrics to Grafana dashboards; pair with alert rules in Prometheus Alertmanager or GitHub Actions status checks.
- Guardrail anomalies (keyword hits, illegal content detections) must create incidents with logs (including anonymized request IDs) and be reviewed within 24 hours.
- Track rate-limiter events per tier, 2FA enrollment/success rates, and blockchain log anchoring success so compliance stories stay visible.
- KPI dashboards must be reviewed in every sprint demo.

## Reporting Cadence

- Daily summary of guardrail alerts plus dataset updates.
- Weekly review covering latency, pass rates, hallucination trends, and query cost vs budget.
- Quarterly governance review including dataset/model versioning and ethical compliance.
