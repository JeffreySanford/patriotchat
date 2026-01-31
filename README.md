# PatriotChat

PatriotChat is a privacy-first, enterprise-grade chat platform that combines an Nx-managed Angular frontend, NestJS API, a shared DTO library, and Go-powered tooling around local Ollama inference. Constitutional guardrails, strongly typed contracts, and transparent governance are embedded in every layer so the project remains auditable when serving hundreds of concurrent, high-sensitivity users.

## Architecture at a glance

- **Nx workspace** coordinates the `frontend`, `api`, `shared`, and `services/heavy` projects plus automation under `tools/`.
- **Angular & Capacitor** use NgModule-based components (no standalone, Signals, or zoneless) with RxJS-driven facades, resolvers, and reactive forms. Capacitor packages the web UI for iOS/Android after `pnpm nx build frontend` + `npx cap sync`.
- **NestJS API** validates DTOs from `@patriotchat/shared`, pipes payloads through guardrail layers, and proxies `/chat`, `/messages`, `/models` to the Go heavy service.
- **Go heavy service** manages Ollama communication, guardrail filtering, dataset uploads, quantized models, and optional PDF/agent helpers.
- **Ollama inference** runs locally (Docker preferred for isolation) so tokens never leave the infrastructure.

## Running locally

1. `pnpm install`
2. `pnpm nx serve frontend` (Angular UI) and `pnpm nx serve api` (Nest API) in separate terminals.
3. `pnpm nx serve heavy` once the Go service exposes Nx targets.
4. `docker compose up ollama` (and add PostgreSQL/Mongo when needed) to start inference and persistence services.
5. `pnpm nx build shared` + `pnpm nx lint frontend api shared` before commits.

## Developer workflow (recommended) 🛠️

Use these commands and checks as part of your daily dev cycle:

- Setup & hooks
  - `pnpm install` — installs dependencies and runs `prepare` to install Husky hooks.
  - If hooks are missing: run `pnpm run prepare`.

- Start services
  - `pnpm run start:all` — opens external terminals for deps (Docker), frontend, API, and heavy service (Windows-friendly helper).
  - Or start services individually with `pnpm run start:frontend|api|heavy|deps`.

- Local verification
  - `pnpm run lint` — fast lint checks.
  - `pnpm run lint:typed` — slow but strict typed ESLint run (recommended before PRs).
  - `pnpm run test` — runs unit tests.
  - `pnpm run lint:rule-tests:typed-lint` — runs the typed-rule unit tests (used by CI).

- Pre-commit & staged checks
  - Husky runs `pnpm run lint:staged` automatically to lint & format staged files. Fix issues locally and re-stage before committing.

- Exception requests & governance
  - Use the provided PR template (auto-applies to new PRs) when requesting exceptions to the policies (Signals, standalone components, Promise/typing exceptions).
  - Add an entry to `documentation/GOVERNANCE.md` referencing the PR, the exception rationale, and the approver. An approver listed in `CODEOWNERS` must explicitly approve the exception in the PR.

Follow this flow and run typed linting regularly to avoid surprises in CI and to keep the codebase consistent and auditable.

## Ollama: Docker vs native

We recommend running Ollama inside Docker (`ollama/ollama:latest`) because the container bundles the server/runtime and keeps the inference endpoint (`http://ollama:11434`) consistent across environments, making guardrail instrumentation and container scanning straightforward. The Go heavy service communicates over HTTP (or via `ollama-go`), so it works equally well with a native Ollama binary, but Docker ensures clean isolation for multi-tenant deployments and easier CI. Point the Go service at your preferred Ollama host with `OLLAMA_HOST=localhost` (or the Docker service name) and `OLLAMA_PORT=11434`.

## Metrics, security & governance

- Track inference latency, guardrail pass rates, hallucination rates, query cost, and E2E pass rates in `documentation/METRICS.md` with Prometheus/Grafana dashboards.
- Document security, legal, and ethics reviews plus dataset licensing in `documentation/SECURITY.md` and the governance log (`documentation/GOVERNANCE.md`).
- All datasets/models must log MCP checkpoints (`tools/checkpoints`) and include traceable metadata before going live. See `tools/checkpoints/README.md` for expected metadata format.
- Follow our `CODE_OF_CONDUCT.md` (root) for contributor behavior and `documentation/INCIDENT_RESPONSE.md` for incident triage, containment, and post-incident reviews.

## Access tiers & audit logging

- Divide usage into free, basic, intensive, and premium tiers with documented rate limits and entitlements; store those policies in `documentation/GOVERNANCE.md` and reference them each release.
- Enforce 2FA for every authenticated user so anonymized audit trails can be correlated with real user identity only during incident reviews; retain only hashed 2FA metadata, never raw secrets.
- Persist session data in SQL or Mongo while keeping inference/log data anonymized at rest. Guardrail telemetry (call/response artifacts, DTO validation traces) writes locally and also publishes hash digests to a blockchain ledger to guarantee immutable, tamper-evident proof without storing sensitive payloads on-chain.
- Treat the blockchain hash anchoring as the long-term storage for audit files; the actual logs remain on-premise, with hashes verified during governance reviews.

## Continuous integration

- The `CI Pipeline` workflow (`.github/workflows/ci.yml`) runs on every push/PR against `main`/`master`.
- It installs dependencies via pnpm, lints `frontend`, `api`, and `shared`, executes the API and end-to-end tests, and exercises the guardrail regression target before the container build and scan steps.
- Container builds/scan steps are gated on the presence of `docker-compose.yml`, so add your compose manifest before expecting the image scans to run.

## Contribution guidance

- Follow `documentation/CODING-STANDARDS.md` for Angular standards, Socket.IO namespacing, and operational expectations.
- Use `documentation/CONTRIBUTING.md` for workflow, issue/PR guidance, and guardrail checklists.
- Keep CI gates (`pnpm nx lint`, `pnpm nx test`, guardrail regression suites, container builds/scans) green before merging.

## Next steps for planning phase

- Monitor the `CI Pipeline` workflow (`.github/workflows/ci.yml`) so the Nx lint/test/guardrail suite and container build/scan steps stay green as the codebase grows.
- Keep `documentation/METRICS.md`, `documentation/SECURITY.md`, and `documentation/GOVERNANCE.md` in sync with dashboards, alerts, and governance changes—each doc is a living artifact for ongoing audits.
- Harden dataset/model governance by tying metadata, license, and guardrail reviews into PR templates, issue workflows, and the governance log.
