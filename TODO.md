# PatriotChat TODO (root)

_Updated 2026-02-03 12:30 UTC · AGILE-informed status tracker · points are relative story effort. Use this doc to track civic LLM development, add timestamps when status shifts, and append to ARCHIVE when items complete._

## 🚀 Current System Status – PRODUCTION READY ✅

**All critical infrastructure operational:**

- ✅ **LLM Inference**: End-to-end working (Ollama → Go service → NestJS → Angular UI)
- ✅ **Type Safety**: Comprehensive improvements (AppException, error handlers, type guards)
- ✅ **Code Quality**: 49% linting improvement (3981 → 2028 issues)
- ✅ **Critical Requirements**: All 5 verified (performance, audit, DB, LLM selector, rate limiting)

**See [PROJECT_STATUS.md](PROJECT_STATUS.md) for complete verification and [linting-summary.txt](linting-summary.txt) for code quality metrics.**

## Status at a Glance

- **Backlog** (planned but not started)
  - Train Constitutional Experiment Assistant (CEA) using JSONL civic prompts + LoRA; points: 8 · timestamp: 2026-02-01 17:30 UTC.
  - Evaluation harness for label discipline, steelman tests, and partisan drift; points: 5 · timestamp: 2026-02-01 17:30 UTC.
  - Retrieval layer (RAG) for modern facts & metadata tracking; points: 5 · timestamp: 2026-02-01 17:30 UTC.

- **In Progress**  
  - Continue reducing linting campaign to <750 errors; Points: 6 · started 2026-02-03 13:30 UTC · progress: Building comprehensive type system to replace any/unknown; added AuthPayload, ErrorDetails, ApiResponse types; fixed health.gateway.ts, auth.controller.ts, jwt.strategy.ts with proper types.
  - E2E test hardening for chat pipeline and telemetry validation; Points: 3 · started 2026-02-03 12:00 UTC · blocker: Awaiting type system completion.

- **Done (This Sprint)**  
  - 🏆 **LLM Service Integration Complete** (2026-02-03 12:00 UTC, Points: 5) – Fixed port (5000→4004), endpoints, response mapping; llama2 loaded; first UI response confirmed.
  - 🏆 **Infrastructure Bug Fixes** (2026-02-03 11:45 UTC, Points: 3) – Fixed infinite loop in health service (interval(0)→interval(30s)); all services healthy.
  - 🏆 **Type Safety & Error Handling** (2026-02-03 11:30 UTC, Points: 8) – Created AppException, error-handler.ts, type-guards.ts; proper error flow across stack.
  - 🏆 **ESLint Linting Campaign** (2026-02-03 11:00 UTC, Points: 13) – Reduced 3981 → 2028 problems (49%); auto-fixed 1946+; manually fixed 151 type safety errors.

- **Done (Previous Sprints)**  
  - Landing + guardrail / metrics UI overhaul; Points: 5 · completed 2026-02-01 16:40 UTC.
  - API status endpoint + tests + jest preset migration; Points: 3 · completed 2026-02-01 15:40 UTC.
  - Playwright landing spec updated with "assistant" headline; Points: 2 · completed 2026-02-01 18:05 UTC.
  - Telemetry gateway + API CORS proof-of-work; Points: 3 · completed 2026-02-01 21:15 UTC.
  - Pipeline telemetry gateway + dashboard metrics wired into the UI; Points: 5 · completed 2026-02-03 12:20 UTC.
  - Document charter/values + agile TODO (this file!); Points: 1 · completed 2026-02-01 19:00 UTC.
  - Validate documentation requirements (CODING-STANDARDS, OVERVIEW, METRICS); Points: 2 · completed 2026-02-01 19:00 UTC.
  - Create LLM documentation suite; Points: 3 · completed 2026-02-01 19:00 UTC.
  - Review and align all documentation markdown files; Points: 2 · completed 2026-02-01 19:30 UTC.
  - Fixed telemetry WebSocket path configuration; Points: 1 · completed 2026-02-01 21:50 UTC.
  - Updated heavy service LLM client to llama2 model; Points: 2 · completed 2026-02-01 21:55 UTC.
  - Reset Nx daemon to resolve project graph errors; Points: 1 · completed 2026-02-01 22:00 UTC.

## AGILE Notes & Principles

- Keep stories small, incremental, and clearly pointed. Each bullet above has intentional points.
- Pair documentation updates with code changes (e.g., TODO + charter).
- Report impediments (e.g., backend port 4200 collisions, heavy service restart needed) in standups / issue trackers.
- When training/evaluation work begins, reference this TODO entry and push updates (status + new timestamps).
- Capture watcher/telemetry restarts (start:all, heavy, Ollama, web server) in the ARCHIVE log so troubleshooting context stays visible.

## ARCHIVE (what completed or rolled back)

1. **2026-02-03 12:30 UTC** – Updated TODO.md with current sprint status; consolidated backlog and in-progress items; aligned all Done tasks with timestamps and story points.
2. **2026-02-03 12:00 UTC** – LLM Service Integration Complete: Fixed port (5000→4004), endpoints, response mapping; llama2 loaded and responding; first UI response confirmed.
3. **2026-02-03 11:45 UTC** – Infrastructure Bug Fixes: Fixed infinite loop in health service (interval(0)→interval(30s)); all services now healthy.
4. **2026-02-03 11:30 UTC** – Type Safety & Error Handling: Created AppException, error-handler.ts, type-guards.ts; proper error flow across stack.
5. **2026-02-03 11:00 UTC** – ESLint Campaign: Reduced 3981 → 2028 problems (49%); auto-fixed 1946+; manually fixed 151 type safety errors.
6. **2026-02-01 15:40 UTC** – API status endpoint + tests launched; jest preset re-pointed.
7. **2026-02-01 16:40 UTC** – Landing/guardrails/metrics UI finished; nav routes wired.
8. **2026-02-01 18:05 UTC** – Playwright `example.spec.ts` adjusted; e2e suites pass.
9. **2026-02-01 17:30 UTC** – TODO doc created to capture charter progress and backlog.
10. **2026-02-01 19:00 UTC** – LLM documentation suite created (charter, training, evaluation); OVERVIEW.md updated.
11. **2026-02-01 19:30 UTC** – Reviewed and aligned documentation files; updated CONTRIBUTING.md, GOVERNANCE.md, SECURITY.md.
12. **2026-02-01 21:15 UTC** – Refined telemetry gateway + API CORS handshake (Socket.IO, strict origin checks, window wiring).
13. **2026-02-01 21:50 UTC** – Fixed telemetry WebSocket path to use '/telemetry' namespace.
14. **2026-02-01 21:55 UTC** – Updated heavy service LLM client to 'llama2'; Docker pulls model on startup.
15. **2026-02-03 12:20 UTC** – Pipeline telemetry gateway added; frontend visualizes three hops.

## Next Agile Steps (Planning)

| Sprint Goal | Work Item | Points | Owner | Status |
| --- | --- | --- | --- | --- |
| **Sprint 2** | Complete linting campaign (<1000 errors) | 5 | TBD | Type safety in remaining services; exclude generated code. |
| **Sprint 2** | E2E test hardening + telemetry validation | 3 | TBD | Full chat pipeline + metrics flow verification. |
| **Sprint 3** | Build JSONL civic instruction dataset & LoRA config | 8 | TBD | Formalize charter + schema; coordinate with Go training. |
| **Sprint 3** | Implement label-discipline evaluation suite | 3 | TBD | Use Go/TS harness; guardrail test evidence logs. |
| **Sprint 4** | Add RAG retrieval connectors | 5 | TBD | Include provenance metadata + values profile filters. |

## Key Documentation References

- **Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md) – Complete verification of all 5 critical requirements
- **Overview**: [documentation/OVERVIEW.md](documentation/OVERVIEW.md) – Architecture and development workflow
- **LLM Docs**: [documentation/LLM/](documentation/LLM/) – Charter, training, evaluation, philosophical notes
- **Code Standards**: [documentation/CODING-STANDARDS.md](documentation/CODING-STANDARDS.md) – Type safety, DTO patterns, linting rules
- **Linting Status**: [linting-summary.txt](linting-summary.txt) – Current metrics (2028 problems, 49% improvement)

> _Update this TODO whenever an item shifts status. Keep ARCHIVE as a running log so reviewers can trace progression._
