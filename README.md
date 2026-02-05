# PatriotChat

PatriotChat is a privacy-first, enterprise-grade civic intelligence platform combining an Nx-managed Angular frontend, NestJS API Gateway with 4-dimensional rate limiting, PostgreSQL audit logs, and Go microservices around local Ollama inference. Constitutional guardrails, strongly typed contracts, immutable audit trails, and transparent governance are embedded in every layer so the platform remains auditable, performant (< 100ms auth), and production-ready.

**[→ View Current Project Status](PROJECT_STATUS.md)** — ✅ All 5 critical requirements met, 9 services running, E2E verified, and the Liberty Mistral v1.0 pipeline now integrated

## 📊 Status at a Glance (Updated 2026-02-04 18:10 UTC)

- **Production Ready**: All critical infrastructure operational ✅
- **LLM Integration**: End-to-end working (Ollama → Go service → NestJS → Angular UI) ✅

- **Liberty Mistral v1.0**: Liberty-first dataset (1,000 prompts) generated, LoRA adapters packaged under `tools/checkpoints/liberty-mistral-v1.0-2026-02-04`, and evaluation prep guided by the Values Commitment in `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md` ✅
- **Code Quality**: 52% linting improvement (3981 → 1860 issues, additional 10 targeted fixes) ✅
- **Type Safety**: AppException, error-handler.ts, type-guards.ts, ValidatedValue type alias implemented ✅
- **This Sprint**: 29+ story points completed (LLM, infrastructure fixes, type safety, linting campaign) ✅

👉 **See [TODO.md](TODO.md) for complete sprint status and [linting-summary.txt](linting-summary.txt) for current code metrics**

## Architecture at a glance

- **Nx monorepo** (v22.4.4) orchestrates: Angular frontend (4200), NestJS gateway (3000), Go microservices (4001-4005), PostgreSQL (5432), Ollama (11434)
- **Angular 17** frontend with model selector dropdown, chat interface, JWT auth via localStorage, analytics tracking
- **NestJS 10 API Gateway** with JWT guards, 4-dimensional rate limiting (IP/user/endpoint/tier), CORS, and service proxying
- **PostgreSQL 16** with immutable audit logs, connection pooling (25 max, 5 idle), and data persistence
- **Go 1.21 Microservices**:
  - **Auth** (4001): JWT generation/validation, bcrypt password hashing, audit logging
  - **Funding** (4002): Campaign finance entity search & records
  - **Policy** (4003): Policy search and tracking
  - **LLM** (4004): Ollama integration, model listing, inference generation
  - **Analytics** (4005): Event tracking with async logging
- **Ollama** (11434): Local LLM hosting (llama2, mistral, neural-chat supported)

## ✅ Critical Requirements Status

All 5 critical requirements have been **met and verified**:

| Requirement | Target | Status | Evidence |
| --- | --- | --- | --- |
| **Performance** | Auth < 100ms | ✅ **57ms** | Measured via health endpoint |
| **Audit Trail** | Immutable PostgreSQL logs | ✅ **Implemented** | `audit_logs` table with RULES |
| **Database** | PostgreSQL with pooling | ✅ **Deployed** | 16-alpine, 25 max connections |
| **LLM Selector** | Frontend model dropdown | ✅ **Operational** | 3 models: llama2, mistral, neural-chat |
| **Rate Limiting** | 4-dimensional guards | ✅ **Active** | IP, user, endpoint, tier-based |

👉 **See [PROJECT_STATUS.md](PROJECT_STATUS.md) for complete verification and metrics**

## 🇺🇸 Values Commitment

PatriotChat is anchored to a liberty-first prior: limited federal government, constitutional guardrails, equality under law, and decentralized self-determination. Every data sprint, model charter, and RAG pipeline should reinforce those principles rather than mirroring modern media narratives. See `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md` for the detailed roadmap that keeps the model on that path.

### Pro-Liberty LLM Workstream

- **Dataset generation**: `pnpm run generate:liberty-prompts` seeds `my_liberty_dataset/train.jsonl` with 1,000 liberty-first Q&A pairs culled from the Federalist/Anti-Federalist canon so enumerated powers, self-determination, and constitutional equality stay front and center (`README.md#values-commitment`).
- **LoRA training**: `liberty-mistral-lora.yaml` runs (via `/home/jeffrey/axolotl-env312/bin/accelerate launch -m axolotl.cli.train liberty-mistral-lora.yaml --report_to none`) have produced `liberty-mistral-out/adapter_model.safetensors` plus tokenizer artifacts; the bundle now lives under `tools/checkpoints/liberty-mistral-v1.0-2026-02-04/` with a README pointing back to the Values Commitment and `documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md`.
- **Evaluation & serving**: The golden prompt suite, citation coverage, and regulatory-drift checks described in `documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md` and `documentation/LLM/LLM-TUNING/LLM_TUNING_AND_RAG.md` gate when Liberty Mistral becomes the default and keep fallback models selectable from the UI.

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
# Start all 9 services at once
docker-compose up -d

# Verify all services are healthy
docker-compose ps

# Access the platform
# - Frontend: http://localhost:4200
# - API Gateway: http://localhost:3000
# - Auth: http://localhost:4001
```

### Option 2: Local Development

```bash
# Install dependencies
pnpm install

# Generate the liberty-first dataset prompts
pnpm run generate:liberty-prompts

# Start services in separate terminals
pnpm run start:all          # (Windows) opens all terminals
# OR manually:
pnpm nx serve frontend      # Terminal 1: Angular UI on 4200
pnpm nx serve api-gateway   # Terminal 2: NestJS on 3000
docker-compose up postgres ollama  # Terminal 3: Dependencies
```

## Running locally

1. `pnpm install` — Install all dependencies and Husky hooks
2. Start services:
   - `docker compose up` — Start PostgreSQL, Ollama, and all services
   - OR `pnpm run start:all` (Windows) or manually in separate terminals
3. Verify: `docker-compose ps` (all services should be healthy)
4. Access frontend: <http://localhost:4200>
5. Test API: `curl http://localhost:3000/health`

## Training the Liberty Mistral Model

1. **Generate the civic JSONL prompts**  
   `pnpm run generate:liberty-prompts` writes 1,000 liberty-first Q&A pairs to `my_liberty_dataset/train.jsonl` using the schema in `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md`, keeping enumerated powers, self-determination, and equality under law at the center (`README.md#values-commitment`).
2. **Run the trimmed LoRA job**  
   From the Python 3.12 environment (`/home/jeffrey/axolotl-env312`), run `/home/jeffrey/axolotl-env312/bin/accelerate launch -m axolotl.cli.train liberty-mistral-lora.yaml --report_to none`. When the job completes, the adapter, tokenizer, and metadata live in `liberty-mistral-out/`, are zipped under `tools/checkpoints/liberty-mistral-v1.0-2026-02-04/`, and the README there points back to the Values Commitment and `documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md`.
3. **Run alignment checks before release**  
   Repeat the golden prompt suite, citation coverage, and regulatory drift monitor documented in `documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md`, log the metrics plus dataset hash in `documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md`, and only then let the UI default to Liberty Mistral while keeping other models selectable from the sidebar.

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

## 📚 Documentation

All documentation is organized in the `documentation/` folder:

- **[documentation/DOCUMENTATION_MAP.md](documentation/DOCUMENTATION_MAP.md)** — Complete reference hierarchy & single source of truth index (start here for navigation!)
- **[documentation/INDEX.md](documentation/INDEX.md)** — Master documentation index
- **[documentation/OVERVIEW.md](documentation/OVERVIEW.md)** — System architecture & development workflow
- **[documentation/api/](documentation/api/)** — Complete API reference
- **[documentation/LLM/](documentation/LLM/)** — LLM system & governance
- **[documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md](documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md)** — Pro-liberty roadmap, curated schema, fine-tuning config, Constitution-first RAG setup
- **[documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md](documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md)** — Automation + regression tests to keep the Values Commitment front and center
- **[documentation/planning/pro-liberty/PRO_LIBERTY_TEST_STRATEGY.md](documentation/planning/pro-liberty/PRO_LIBERTY_TEST_STRATEGY.md)** — Alignment-focused tests to guard Values Commitment
- **[documentation/planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md](documentation/planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md)** — Batch-level dataset sprint plan for PRO-LLM-002
- **[documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md](documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md)** — Sprint tracking board for vision checks, training bursts, RAG rollout, and evaluations
- **[documentation/CODING-STANDARDS.md](documentation/CODING-STANDARDS.md)** — Code standards & patterns
- **[documentation/CONTRIBUTING.md](documentation/CONTRIBUTING.md)** — How to contribute
- **[documentation/GOVERNANCE.md](documentation/GOVERNANCE.md)** — Project governance & exceptions

👉 **For complete documentation map with all cross-references, see [documentation/DOCUMENTATION_MAP.md](documentation/DOCUMENTATION_MAP.md)**

## Ollama: Docker vs native

We recommend running Ollama inside Docker (`ollama/ollama:latest`) because the container bundles the server/runtime and keeps the inference endpoint (`http://ollama:11434`) consistent across environments, making guardrail instrumentation and container scanning straightforward. The Go heavy service communicates over HTTP (or via `ollama-go`), so it works equally well with a native Ollama binary, but Docker ensures clean isolation for multi-tenant deployments and easier CI. Point the Go service at your preferred Ollama host with `OLLAMA_HOST=localhost` (or the Docker service name) and `OLLAMA_PORT=11434`.

## 📊 Service Endpoints & Testing

### Health Checks (verify all services running)

```bash
# Test each service
curl http://localhost:3000/health          # API Gateway
curl http://localhost:4001/health          # Auth service
curl http://localhost:4002/health          # Funding service
curl http://localhost:4003/health          # Policy service
curl http://localhost:4004/health          # LLM service
curl http://localhost:4005/health          # Analytics service
```

### Core Workflows

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user123","email":"user@example.com","password":"SecurePass123!"}'

# 2. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'

# 3. Get LLM models
curl http://localhost:4004/inference/models

# 4. Search funding
curl "http://localhost:4002/funding/search?entity_id=test-entity"

# 5. Search policies
curl "http://localhost:4003/policy/search?entity_id=test-entity"
```

## Architecture Documentation

- **[OVERVIEW.md](documentation/OVERVIEW.md)** — Complete architecture, design decisions, and how systems integrate
- **[CODING-STANDARDS.md](documentation/CODING-STANDARDS.md)** — Code standards, Angular guidelines, typing policies
- **[CONTRIBUTING.md](documentation/CONTRIBUTING.md)** — How to contribute, PR process, governance
- **[SECURITY.md](documentation/SECURITY.md)** — Security practices, audit requirements, incident response
- **[GOVERNANCE.md](documentation/GOVERNANCE.md)** — Project governance, rate tiers, dataset policies
- **[METRICS.md](documentation/METRICS.md)** — KPIs, monitoring, performance targets
- **[LLM/](documentation/LLM/)** — LLM-specific documentation (charter, training, evaluation)

## Metrics, security & governance

- Track inference latency, guardrail pass rates, hallucination rates, query cost, and E2E pass rates in `documentation/METRICS.md` with Prometheus/Grafana dashboards.
- Document security, legal, and ethics reviews plus dataset licensing in `documentation/SECURITY.md` and the governance log (`documentation/GOVERNANCE.md`).
- All datasets/models must log MCP checkpoints (`tools/checkpoints`) and include traceable metadata before going live. See `tools/checkpoints/README.md` for expected metadata format.
- Follow our `CODE_OF_CONDUCT.md` (root) for contributor behavior and `documentation/INCIDENT_RESPONSE.md` for incident triage, containment, and post-incident reviews.

## Access tiers & audit logging

- **Rate Tiers**: Free (100/hr, 1K/day) → Power (1K/hr, 10K/day) → Premium (10K/hr, 100K/day)
- **Audit Logging**: All operations logged to PostgreSQL with immutable RULES, async goroutine processing (non-blocking)
- **Authentication**: JWT tokens (24-hour expiry), bcrypt password hashing, token validation endpoint
- **Data Protection**: PostgreSQL on secure internal port, connection pooling, CORS configured, Helmet security headers

## Continuous integration

- The `CI Pipeline` workflow (`.github/workflows/ci.yml`) runs on every push/PR against main/master.
- It installs dependencies via pnpm, lints frontend/api/shared, executes unit and E2E tests, builds containers, and scans images.
- All checks must pass before merging.

## Contribution guidance

- Follow `documentation/CODING-STANDARDS.md` for code standards and architectural requirements.
- Use `documentation/CONTRIBUTING.md` for workflow, issue/PR guidance, and checklists.
- Keep CI gates (`pnpm nx lint`, `pnpm nx test`, container builds) green before opening PRs.
- Reference `documentation/GOVERNANCE.md` for exception requests and governance updates.

## Next Steps & Roadmap

### Phase 1: LLM Training (Sprint 1-2)

- [x] Build JSONL civic instruction dataset with TypeScript schema and generate 1,000 liberty-first prompts (`my_liberty_dataset/train.jsonl`).  
- [x] Run the trimmed Liberty Mistral LoRA training (`liberty-mistral-lora.yaml`) – resulting adapter/tokenizer/metadata live in `liberty-mistral-out/` and the zipped bundle lives under `tools/checkpoints/liberty-mistral-v1.0-2026-02-04/` with Values Commitment notes.
- [ ] Implement the label-discipline evaluation suite, regulatory drift checks, and citation coverage logging (`documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md`) before declaring Liberty Mistral the default.
- [ ] Publish evaluation snapshots, dataset hashes, and bias scores in `documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md`.

### Phase 2: Data Integration (Sprint 3-4)

- [ ] Add the Constitution-first RAG retrieval layer with `source_type=founding_core` prioritization (`documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md`).
- [ ] Implement provenance metadata tracking for policy/funding sources and guardrail citations.
- [ ] Build values-profile filters so UI queries can gain liberty-focused context.

### Phase 3: Production Ops (Ongoing)

- [ ] Set up GitHub Actions CI/CD pipeline
- [ ] Add Prometheus + Grafana monitoring
- [ ] Create Kubernetes manifests for cloud deployment
- [ ] Migrate to managed PostgreSQL (RDS/Cloud SQL)

👉 **See [TODO.md](TODO.md) for detailed agile sprint planning and tracking**

## Production Deployment

### Docker Compose (Current)

All 9 services run in Docker with health checks, proper dependency ordering, and named volumes for persistence.

### Kubernetes Ready

Service architecture follows microservices best practices suitable for Kubernetes. Each service:

- Has health (`/health`) and readiness (`/ready`) endpoints
- Runs in isolated containers with minimal surface area
- Configures via environment variables
- Logs to stdout/stderr

### Scaling Considerations

- **Stateless services** (frontend, gateway, microservices) can scale horizontally
- **Stateful services** (PostgreSQL, Ollama) require careful lifecycle management
- **Rate limiting** persists in-memory (upgrade to Redis for distributed deployments)

---

## 📞 Support & Questions

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Documentation**: Check [documentation/](documentation/) for comprehensive guides
- **Questions**: See [documentation/CONTRIBUTING.md](documentation/CONTRIBUTING.md#getting-help)
- **Security**: Report security issues via [documentation/SECURITY.md](documentation/SECURITY.md)

---

**Last Updated**: 2026-02-04  
**Status**: ✅ Production-Ready · All 5 Critical Requirements Met · 9 Services Running · E2E Verified
