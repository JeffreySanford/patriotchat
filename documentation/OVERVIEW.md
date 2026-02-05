# PatriotChat Overview

## Vision

PatriotChat is a local-first Nx monorepo that balances constitutional guardrails, strongly typed DTO contracts, and user-owned LLM control. Every inference run stays inside locally hosted Ollama instances, proxies requests through the Go heavy service, and filters answers against curated patriotic datasets so the platform avoids narrative-driven bias while remaining transparent and auditable.

All documentation (see README’s Values Commitment section) references the same liberty-first north star: limited federal government, equality under law, decentralization, and constitutional guardrails. Refer to `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md`, `documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md`, `documentation/planning/pro-liberty/PRO_LIBERTY_TEST_STRATEGY.md`, and `documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md` to follow that plan and catch drift before it reaches production inference.

## Architecture

### Nx workspace

Nx orchestrates the Angular frontend, the NestJS API, the shared `@patriotchat/shared` DTO library, the `services/heavy` Go helpers, and workspace tooling under `tools/`. Nx targets (build, lint, test, serve, graph) are the guardrails for automation, so rely on `pnpm nx <target>` instead of random CLI commands.

### Angular & Capacitor

The frontend stays module-first: every component exists inside an NgModule with `standalone: false`, resolver-backed routes, and shared material imports instead of `CUSTOM_ELEMENTS_SCHEMA`. We avoid Angular Signals so RxJS hot observables (`shareReplay`, `BehaviorSubject`, facades) control state, reactive forms handle rich inputs, and dependency-injected services keep validation consistent. Capacitor wraps the production Angular bundles for iOS and Android; after `pnpm nx build frontend`, run `npx cap sync` followed by `npx cap run ios` or `npx cap run android` to keep the native shells aligned.

### NestJS API

The `api` app enforces DTO contracts imported from `@patriotchat/shared`, applies validation pipes, and proxies `/chat`, `/messages`, and `/models` to the Go heavy service. Controllers use the shared types so the same validation logic and guardrail filters exist front-to-back.

### Go heavy service

`services/heavy` hosts the Go proxy that talks to Ollama, streams chunked responses, and applies guardrail filters (keyword/regex) before returning text to Nest or the UI. It also manages dataset uploads, model quantization, optional PDF agents, and any helpers that benefit from native compute.

### Ollama & fine-tuning

Ollama runs inside Docker (`ollama/ollama:latest`) with a mounted GGUF volume and optional GPU access (`--gpus all`). The Go service hits `http://ollama:11434` so tokens never leave the infrastructure. Fine-tuning follows an Unsloth/LoRA workflow: curate prompt-response pairs, train on your GPU, export tuned GGUF, import via `ollama create`, and log MCP checkpoints (loss, dataset hash, timestamp) under `tools/checkpoints`.

## Guardrails & Standards

Alignment with `documentation/CODING-STANDARDS.md` is required: no standalone components or Signals, resolvers for routes, hot observables for state, NgModule declarations, and explicit material imports. Socket events adopt the `domain:entity:action` naming convention, datasets trigger guardrail checks, and every DTO ensures type-safe transports for Angular services and Nest controllers.

## Development workflow

1. `pnpm install`
2. `pnpm nx serve frontend` and `pnpm nx serve api` in separate terminals, then `pnpm nx serve heavy` after the Go targets exist.
3. `docker compose up ollama` (add PostgreSQL or MongoDB if persistence is required).
4. `pnpm nx build shared` plus `pnpm nx lint frontend api shared` keep contracts and formatting aligned.
5. Visualize dependencies with `pnpm nx graph`.

## How to run locally

1. `pnpm install` to install dependencies.
2. `pnpm nx serve frontend` for the Angular UI.
3. `pnpm nx serve api` for the Nest backend.
4. `pnpm nx serve heavy` once Go targets are exposed.
5. `docker compose up ollama` (and `docker compose up -d postgres` or `mongo` when persistence is needed) to start inference and database services.
6. Build shared libraries with `pnpm nx build shared`, then `pnpm nx lint frontend api shared` before committing.

**Tip:** Use `pnpm run start:all` (Windows) to open external terminals for services and keep a local `pnpm run build:watch` active for iterative development.

## Testing & operations

- Lint: `pnpm nx lint frontend api shared`
- API tests: `pnpm nx test api`
- End-to-end: `pnpm nx e2e frontend-e2e`
- Go harness (if defined): `pnpm nx test heavy`
- Container compose: `docker compose up --build` for Ollama, API, Go service, and databases.
- Capacitor: after building the Angular output run `npx cap sync` then `npx cap run ios` or `npx cap run android`.

## Operations & governance

- Track KPIs such as inference latency, hallucination rate, guardrail pass rate, and query cost in `documentation/METRICS.md`; hook those metrics into dashboards and alerts so regressions surface quickly.
- Keep dataset metadata (version, license, guardrail tags) next to uploads and document updates in a governance log plus mandatory human reviews before political-alignment shifts.
- Define security, legal, and ethics reviews in `SECURITY.md`, and let every dataset or dataset-change pull request reference the relevant review artifacts.
- Capture contributor expectations in `CONTRIBUTING.md`, enforce coding standards via issue/PR templates, and link to `CODE_OF_CONDUCT.md` so community norms stay visible.
- CI gates should run lint, unit, contract, and guardrail regression tests plus container builds and scans before merging.

## Rate tiers & audit logging

- Offer free, basic, intensive, and premium tiers with documented rate limits and entitlements; reference these policies in `documentation/GOVERNANCE.md` whenever you update usage controls.
- Require 2FA from authenticated users so anonymized audit trails can map back during investigations while retaining only hashed 2FA metadata in storage.
- Keep inference/guardrail traces anonymized; persist session data in SQL/Mongo, but anchor guardrail log hashes to a blockchain ledger for immutable proof while the raw logs stay on-premise.

## Next steps

- Ensure the `CI Pipeline` workflow (`.github/workflows/ci.yml`) continues to run the Nx lint/test/guardrail suites, build containers, and scan images on every push and PR.
- Publish and maintain `documentation/METRICS.md`, `SECURITY.md`, `CONTRIBUTING.md`, and the governance log as living documents; link to these from PR templates and the governance review process.

## LLM Development

For creating and training a custom LLM aligned with constitutional values, refer to:

- [LLM Creation Guide](LLM/LLM-CREATION.md): Step-by-step process for training and implementation.
- [Model Charter](LLM/MODEL-CHARTER.md): Detailed charter for the Constitutional Experiment Assistant.
- [Training Data Sources](LLM/TRAINING-DATA-SOURCES.md): Recommended sources and recipes for unbiased data.
- [Evaluation Checklist](LLM/EVALUATION-CHECKLIST.md): Criteria for testing alignment and bias.
- [Philosophical Notes](LLM/PHILOSOPHICAL-NOTES.md): Reflections on bias, neutrality, and American values.
- [Architecture Overview](LLM/ARCHITECTURE.md): System components and data flow.
- [Testing Plan](LLM/TESTING-PLAN.md): Strategies for quality assurance.
- [Pro-Liberty Build Guide](planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md): Hardware, dataset schema, Axolotl config, and Constitution-first RAG wiring.
- [Pro-Liberty Tracking](planning/pro-liberty/PRO_LIBERTY_TRACKING.md): Sprint board for vision checks, data sprints, RAG rollout, and governance messaging.
- [Pro-Liberty Test Strategy](planning/pro-liberty/PRO_LIBERTY_TEST_STRATEGY.md): Alignment-focused automated test ideas and reporting.
- [Pro-Liberty Alignment Tests](planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md): Regression harness + UI checks that keep the Values Commitment in every release.
- [Pro-Liberty Data Pipeline](planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md): Batch-level sprint plan for dataset curation + LoRA training.

Use this overview as the baseline for Copilot prompts, sprint plans, and guardrail documentation; update it whenever the stack shifts. When generating or updating Copilot instructions, explicitly cite the Values Commitment (`README.md#values-commitment`) and point to the pro-liberty playbooks (`planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md`, `planning/pro-liberty/PRO_LIBERTY_TRACKING.md`, `planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md`) so every Copilot task stays aligned with the constitutional guardrails.
