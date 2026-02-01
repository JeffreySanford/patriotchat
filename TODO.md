# PatriotChat TODO (root)

_Updated 2026-02-01 19:45 UTC · AGILE-informed status tracker · points are relative story effort.  Use this doc to keep the chartered civic LLM work visible, add timestamps whenever a bullet shifts status, and append to the ARCHIVE section when things wrap or roll back._

## Status at a Glance

- **Backlog** (planned but not started)
  - Train Constitutional Experiment Assistant (CEA) using JSONL civic prompts + LoRA; points: 8 · timestamp: 2026-02-01 17:30 UTC.
  - Evaluation harness for label discipline, steelman tests, and partisan drift; points: 5 · timestamp: 2026-02-01 17:30 UTC.
  - Retrieval layer (RAG) for modern facts & metadata tracking; points: 5 · timestamp: 2026-02-01 17:30 UTC.

- **In Progress**  
  - Stabilize the telemetry socket handshake and API CORS guardrail so the UI, API, and WebSocket gateway can safely exchange updates; Points: 3 · started 2026-02-01 19:40 UTC.
  - Ensure the front-end-to-heavy e2e path remains observable once the telemetry pipeline is healthy; Points: 3 · started 2026-02-01 17:00 UTC.
  - Fix LLM model loading in heavy service to use available Ollama models and update Docker setup for model pulling; Points: 2 · started 2026-02-01 21:45 UTC.

- **Done**  
  - Landing + guardrail / metrics UI overhaul; Points: 5 · completed 2026-02-01 16:40 UTC.  
  - API status endpoint + tests + jest preset migration; Points: 3 · completed 2026-02-01 15:40 UTC.  
  - Playwright landing spec updated with “assistant” headline; Points: 2 · completed 2026-02-01 18:05 UTC.  
  - Telemetry gateway + API CORS proof-of-work (new Socket.IO gateway, CORS rules, and window helpers) so the front-end can emit metrics without 400s; Points: 3 · completed 2026-02-01 21:15 UTC.  
  - Pipeline telemetry gateway + dashboard metrics wired into the UI and tracked via sockets; Points: 5 · completed 2026-02-03 12:20 UTC.
  - Document charter/values + agile TODO (this file!); Points: 1 · completed 2026-02-01 19:00 UTC.
  - Validate documentation requirements (CODING-STANDARDS, OVERVIEW, METRICS) against the current flow and capture any gaps; Points: 2 · completed 2026-02-01 19:00 UTC.
  - Create LLM documentation files (charter, training sources, evaluation, philosophical notes) and organize in LLM/ subdirectory; Points: 3 · completed 2026-02-01 19:00 UTC.
  - Review and align all documentation markdown files for consistency; Points: 2 · completed 2026-02-01 19:30 UTC.
  - Fixed telemetry WebSocket path configuration to use correct namespace and removed redundant path options; Points: 1 · completed 2026-02-01 21:50 UTC.
  - Updated heavy service LLM client to use llama2 model and modified Docker Compose to pull the model on startup; Points: 2 · completed 2026-02-01 21:55 UTC.

## AGILE Notes & Principles

- Keep stories small, incremental, and clearly pointed. Each bullet above has intentional points.  
- Pair documentation updates with code changes (e.g., TODO + charter).  
- Report impediments (e.g., backend port 4200 collisions, heavy service restart needed) in standups / issue trackers.
- When training/evaluation work begins, reference this TODO entry and push updates (status + new timestamps).
- Capture watcher/telemetry restarts (start:all, heavy, Ollama, web server) in the ARCHIVE log so troubleshooting context stays visible.

## ARCHIVE (what completed or rolled back)

1. `2026-02-01 15:40 UTC` – API status endpoint + tests launched; jest preset re-pointed to `jest-preset/jest-preset.js`; folder recorded in history.  
2. `2026-02-01 16:40 UTC` – Landing/guardrails/metrics UI finished, quick links updated, nav routes wired, and `main-stage` spec added.  
3. `2026-02-01 18:05 UTC` – Playwright `example.spec.ts` adjusted to expect new landing headline; e2e suites now pass after port cleanup.  
4. `2026-02-01 17:30 UTC` – TODO doc created to capture charter progress and backlog for future AGILE planning.
5. `2026-02-03 12:20 UTC` – Pipeline telemetry gateway added, frontend telemetry service visualizes the three hops, and TODO reflects the success.
6. `2026-02-01 19:00 UTC` – LLM documentation files created (charter, training sources, evaluation checklist, philosophical notes) and organized in documentation/LLM/ subdirectory; OVERVIEW.md updated with links.
7. `2026-02-01 19:30 UTC` – Reviewed and aligned all documentation markdown files for consistency; updated CONTRIBUTING.md, GOVERNANCE.md, and SECURITY.md to reference LLM docs.
8. `2026-02-01 21:15 UTC` – Refined the telemetry gateway + API CORS handshake (new Socket.IO gateway, strict origin checks, and window wiring) so the frontend pipeline sockets and API routes no longer respond with 400s.
9. `2026-02-01 21:50 UTC` – Fixed telemetry WebSocket path configuration by changing the gateway to use namespace '/telemetry' with default Socket.IO path, and removed redundant path option from frontend client to prevent double-path issues.
10. `2026-02-01 21:55 UTC` – Updated heavy service LLM client default model to 'llama2' and modified Docker Compose to pull the llama2 model on Ollama startup, ensuring the API query endpoint can successfully call the LLM without 500 errors.

## Next Agile Steps (Planning)

| Sprint Goal | Work Item | Points | Owner | Notes |
| --- | --- | --- | --- | --- |
| Sprint 1 | Build JSONL civic instruction dataset & LoRA config (with TypeScript schema) | 8 | TBD | Start by formalizing charter + dataset schema; coordinate with Go training pipeline. |
| Sprint 1 | Implement label-discipline evaluation suite (10 prompts) | 3 | TBD | Use Go/TS harness; guardrail test evidence logs. |
| Sprint 2 | Add RAG retrieval connectors for modern civic data | 5 | TBD | Include provenance metadata + values profile filters. |

> _Whenever a sprint item shifts from backlog→in progress→done, update its status/timestamp here and append a new entry to ARCHIVE.  Keep the past history as a running log so reviewers can trace progression without breaking claims._
