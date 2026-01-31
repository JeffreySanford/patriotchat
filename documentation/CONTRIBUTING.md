# Contributing to PatriotChat

We value clarity, reproducibility, and auditable guardrails. Contributors should follow the coding standards, CI expectations, and documentation listed in this project before opening PRs.

## Getting Started

1. `pnpm install`
2. `pnpm nx lint frontend api shared`
3. `pnpm nx test api` (and `pnpm nx test heavy` once the Go harness is available)
4. `pnpm nx e2e frontend-e2e` for any UI changes
5. `pnpm nx graph` to understand dependencies

## Documentation & Guardrails

- Read `documentation/CODING-STANDARDS.md` for Angular, Socket.IO, dataset, and operational expectations.
- Reference `documentation/METRICS.md` for KPIs/data you are helping to protect or improve.
- Review `documentation/SECURITY.md` before touching datasets, models, or guardrail logic.
- Update `documentation/GOVERNANCE.md` when submitting new datasets, models, or guardrail rules.
- When working on rate limits, tiering, or 2FA flows, cite the access policies in `documentation/GOVERNANCE.md` and describe how anonymized audit logs plus blockchain anchoring behave.

## Pull Request Guidelines

- Use the PR templates (TBD) to describe the change, testing, and guardrail impact.
- Link to relevant documents (metrics, governance log, security review) when updating policies or datasets.
- Ensure CI gates (lint/test/guardrail suites) pass before requesting review.
- Self-review guardrail metrics: highlight expected latency, hallucination, and guardrail pass impacts.

## Issue Triage

- Label incidents using `security`, `governance`, or `ops` when they relate to guardrails, datasets, or metrics.
- Document reproduction steps, DTO contracts touched, and any call/response telemetry references.
- Assign the issue to the appropriate reviewer (security, legal, or engineering).

## Communication & Respect

- Follow `CODE_OF_CONDUCT.md` (once added) for respectful collaboration.
- Document ethical considerations when rallying political content reviews.
