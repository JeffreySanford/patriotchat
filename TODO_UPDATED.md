# PatriotChat TODO (root)

_Updated 2026-02-03 12:30 UTC · AGILE-informed status tracker · points are relative story effort. Use this doc to track civic LLM development, add timestamps when status shifts, and append to ARCHIVE when items complete._

## 🚀 Current System Status

**Production Ready** ✅ 

All critical infrastructure operational:
- **LLM Inference**: End-to-end working (Ollama → Go service → NestJS → Angular UI)
- **Type Safety**: Comprehensive improvements (AppException, error handlers, type guards)
- **Code Quality**: 49% linting improvement (3981 → 2028 issues)
- **Critical Requirements**: All 5 verified (performance, audit, DB, LLM selector, rate limiting)

## Status at a Glance

- **Backlog** (planned but not started)
  - Train Constitutional Experiment Assistant (CEA) using JSONL civic prompts + LoRA; points: 8 · timestamp: 2026-02-01 17:30 UTC.
  - Evaluation harness for label discipline, steelman tests, and partisan drift; points: 5 · timestamp: 2026-02-01 17:30 UTC.
  - Retrieval layer (RAG) for modern facts & metadata tracking; points: 5 · timestamp: 2026-02-01 17:30 UTC.

- **In Progress**  
  - Complete remaining linting campaign (target: <1000 errors); Points: 5 · started 2026-02-03 10:00 UTC · progress: 1709 errors fixed, continuing systematic fixes in other services.
  - E2E test hardening for chat pipeline and telemetry validation; Points: 3 · started 2026-02-03 12:00 UTC · blocker: Awaiting linting completion.

- **Done (This Sprint)**  
  - 🎯 **LLM Service Integration Complete** (2026-02-03 12:00 UTC, Points: 5)
    - Fixed port configuration (5000 → 4004)
    - Corrected API endpoints (/inference/models, /inference/generate)
    - Fixed response field mapping (Go result → TS text)
    - Loaded llama2 model (3.8 GB) in Ollama
    - First working LLM response displaying in UI ✓
  - 🎯 **Infrastructure Bug Fixes** (2026-02-03 11:45 UTC, Points: 3)
    - Fixed infinite loop in health service (interval(0) → interval(30s))
    - All 9 services healthy and communicating
  - 🎯 **Type Safety & Error Handling** (2026-02-03 11:30 UTC, Points: 8)
    - Created AppException class for type-safe error handling
    - Created error-handler.ts utility (getErrorMessage, getErrorStatus)
    - Created type-guards.ts utility (isRequestLike, isResponseLike, safe getters)
    - Fixed inference service with proper TypeScript interfaces
    - Fixed rate-limiting guard with robust type guards
    - Fixed NestJS main.ts (NestExpressApplication type)
  - 🎯 **ESLint Linting Campaign** (2026-02-03 11:00 UTC, Points: 13)
    - Reduced from 3981 → 2028 total problems (49% improvement)
    - Fixed 1946+ issues via auto-fix
    - Fixed 151 type safety errors manually
    - Created utilities to handle remaining edge cases

- **Done (Previous Sprints)**  
  - Landing + guardrail / metrics UI overhaul; Points: 5 · completed 2026-02-01 16:40 UTC.  
  - API status endpoint + tests + jest preset migration; Points: 3 · completed 2026-02-01 15:40 UTC.  
  - Playwright landing spec; Points: 2 · completed 2026-02-01 18:05 UTC.  
  - Telemetry gateway + API CORS; Points: 3 · completed 2026-02-01 21:15 UTC.  
  - Pipeline telemetry wired to dashboard; Points: 5 · completed 2026-02-03 12:20 UTC.
  - Documentation charter/values + agile TODO; Points: 1 · completed 2026-02-01 19:00 UTC.
  - LLM documentation suite; Points: 3 · completed 2026-02-01 19:00 UTC.
  - Documentation alignment review; Points: 2 · completed 2026-02-01 19:30 UTC.
  - Fixed telemetry WebSocket path; Points: 1 · completed 2026-02-01 21:50 UTC.
  - Updated heavy service LLM + Docker; Points: 2 · completed 2026-02-01 21:55 UTC.
  - Nx daemon reset; Points: 1 · completed 2026-02-01 22:00 UTC.

## AGILE Notes & Principles

- Keep stories small, incremental, and clearly pointed. Each bullet has intentional points.  
- Pair documentation updates with code changes (TODO + charter).  
- Report impediments in standups / issue trackers (e.g., port collisions, service restarts).
- When training/evaluation work begins, reference this TODO and push updates with timestamps.
- Capture watcher/telemetry restarts (start:all, heavy, Ollama) in ARCHIVE so troubleshooting context stays visible.

## ARCHIVE (what completed or rolled back)

1. **2026-02-03 12:30 UTC** – Updated TODO.md with current sprint status; consolidated backlog and in-progress items; aligned all Done tasks with timestamps and story points.
2. **2026-02-03 12:00 UTC** – LLM Service Integration Complete: Fixed port (5000→4004), endpoints, response mapping; llama2 loaded and responding; first UI response confirmed.
3. **2026-02-03 11:45 UTC** – Infrastructure Bug Fixes: Fixed infinite loop in health service (interval(0)→interval(30s)); all services now healthy.
4. **2026-02-03 11:30 UTC** – Type Safety & Error Handling: Created AppException, error-handler.ts, type-guards.ts; proper error flow across stack.
5. **2026-02-03 11:00 UTC** – ESLint Campaign: Reduced 3981 → 2028 problems (49%); auto-fixed 1946+; manually fixed 151 type safety errors.
6. **2026-02-01 15:40 UTC** – API status endpoint + tests launched; jest preset re-pointed to `jest-preset/jest-preset.js`.
7. **2026-02-01 16:40 UTC** – Landing/guardrails/metrics UI finished; quick links updated; nav routes wired; main-stage spec added.
8. **2026-02-01 18:05 UTC** – Playwright `example.spec.ts` adjusted to expect new landing headline; e2e suites now pass.
9. **2026-02-01 17:30 UTC** – TODO doc created to capture charter progress and backlog for AGILE planning.
10. **2026-02-01 19:00 UTC** – LLM documentation files created (charter, training sources, evaluation, philosophical notes); OVERVIEW.md updated.
11. **2026-02-01 19:30 UTC** – Reviewed and aligned all documentation markdown files for consistency; updated CONTRIBUTING.md, GOVERNANCE.md, SECURITY.md.
12. **2026-02-01 21:15 UTC** – Refined telemetry gateway + API CORS handshake (new Socket.IO gateway, strict origin checks, window wiring).
13. **2026-02-01 21:50 UTC** – Fixed telemetry WebSocket path by changing gateway to use namespace '/telemetry' with default path.
14. **2026-02-01 21:55 UTC** – Updated heavy service LLM client default model to 'llama2'; Docker Compose pulls model on Ollama startup.
15. **2026-02-01 22:00 UTC** – Reset Nx daemon by removing .nx cache directory to resolve project graph computation errors.

## Next Agile Steps (Planning)

| Sprint Goal | Work Item | Points | Owner | Notes |
| --- | --- | --- | --- | --- |
| **Sprint 2** | Complete linting campaign (<1000 errors) | 5 | TBD | Focus on type safety in remaining services; exclude generated code. |
| **Sprint 2** | E2E test hardening + telemetry validation | 3 | TBD | Verify full chat pipeline + metrics flow; add guardrail tests. |
| **Sprint 3** | Build JSONL civic instruction dataset & LoRA config | 8 | TBD | Formalize charter + dataset schema; coordinate with Go training pipeline. |
| **Sprint 3** | Implement label-discipline evaluation suite | 3 | TBD | Use Go/TS harness; guardrail test evidence logs. |
| **Sprint 4** | Add RAG retrieval connectors for modern civic data | 5 | TBD | Include provenance metadata + values profile filters. |

> _Whenever a sprint item shifts from backlog→in progress→done, update its status/timestamp here and append a new entry to ARCHIVE. Keep the past history as a running log so reviewers can trace progression._

## Key Files & References

- **Status**: [PROJECT_STATUS.md](PROJECT_STATUS.md) – Complete verification of all 5 critical requirements
- **Overview**: [documentation/OVERVIEW.md](documentation/OVERVIEW.md) – Architecture and development workflow
- **LLM Docs**: [documentation/LLM/](documentation/LLM/) – Charter, training sources, evaluation plan, philosophical notes
- **Code Standards**: [documentation/CODING-STANDARDS.md](documentation/CODING-STANDARDS.md) – Type safety, DTO patterns, linting rules
- **Linting**: [linting-summary.txt](linting-summary.txt) – Current linting status (2028 problems, 49% improvement)
