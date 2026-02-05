# Documentation Map – Single Source of Truth Hierarchy

_Updated 2026-02-04 11:30 UTC · Establishes clear ownership and reduces redundancy across all 55 markdown files · Moved to documentation/ folder as single reference hub_

## Documentation Hierarchy & Ownership

### Primary Sources of Truth

These files are the authoritative source for their respective domains. All other documentation should reference these when covering the same topics.

| Document | Primary Purpose | Owner | When to Update |
| --- | --- | --- | --- |
| [../README.md](../README.md) | **Quick Start & Status Overview** | DevOps/PM | After each sprint (status updates); after infrastructure changes |
| [../PROJECT_STATUS.md](../PROJECT_STATUS.md) | **Critical Requirements Verification** | QA/Product | After verification runs; after requirement changes |
| [../TODO.md](../TODO.md) | **Sprint Status & AGILE Tracking** | Tech Lead | After each status shift; before/after sprint planning |
| [OVERVIEW.md](OVERVIEW.md) | **System Architecture & Development Workflow** | Architects | After architectural decisions; after workflow process changes |
| [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md) | **Detailed Service Specifications** | Backend Lead | After service changes; after protocol updates |
| [CODING-STANDARDS.md](CODING-STANDARDS.md) | **Code Quality & Standards** | Tech Lead | After standards updates; after linting campaign completions |
| [api/QUICK_REFERENCE.md](api/QUICK_REFERENCE.md) | **API Endpoints Quick Lookup** | API Owner | After endpoint changes; after version updates |
| [LLM/MODEL-CHARTER.md](LLM/MODEL-CHARTER.md) | **LLM Constitutional Values & Principles** | LLM Lead | After constitutional values updates |
| [../linting-summary.txt](../linting-summary.txt) | **Current Linting Metrics** | DevOps | After each linting campaign phase |

---

## Reference & Supporting Documentation

These files provide detailed reference material and should link back to primary sources where applicable.

### API Documentation

| Document | Purpose | Replaces/Refs | Notes |
| --- | --- | --- | --- |
| [api/INDEX.md](api/INDEX.md) | API navigation hub | — | Links to all API docs; keep updated |
| [api/GUIDE.md](api/GUIDE.md) | Detailed API usage guide | Detailed how-to references | Examples for each endpoint family |
| [api/EXAMPLES.md](api/EXAMPLES.md) | Copy-paste API examples | Practical code samples | cURL + client library examples |
| [api/ENDPOINTS_SUMMARY.md](api/ENDPOINTS_SUMMARY.md) | All endpoints with descriptions | Endpoint reference | Supplements QUICK_REFERENCE.md |

### LLM Documentation

| Document | Purpose | Scope | Notes |
| --- | --- | --- | --- |
| [LLM/MODEL-CHARTER.md](LLM/MODEL-CHARTER.md) | Constitutional values & guardrails | Constitutional Experiment Assistant | Primary LLM governance document |
| [LLM/LLM-CREATION.md](LLM/LLM-CREATION.md) | Step-by-step LLM training guide | Training workflow | References TRAINING-DATA-SOURCES.md |
| [LLM/TRAINING-DATA-SOURCES.md](LLM/TRAINING-DATA-SOURCES.md) | Recommended data sources | Dataset curation | Unbiased civic data recommendations |
| [LLM/EVALUATION-CHECKLIST.md](LLM/EVALUATION-CHECKLIST.md) | Model quality criteria | Evaluation framework | Bias, alignment, performance checks |
| [LLM/PHILOSOPHICAL-NOTES.md](LLM/PHILOSOPHICAL-NOTES.md) | Reflections on bias & values | Context & rationale | Historical & philosophical context |
| [LLM/TESTING-PLAN.md](LLM/TESTING-PLAN.md) | QA strategy for LLM | Test methodology | Integration, unit, bias testing |
| [LLM/ARCHITECTURE.md](LLM/ARCHITECTURE.md) | LLM system components | Detailed architecture | References MICROSERVICES_ARCHITECTURE.md |
| [planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md](planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md) | Pro-liberty tuning roadmap | Dataset schema, Axolotl config, Constitution-first RAG | Supplements LLM tuning doc |
| [planning/pro-liberty/PRO_LIBERTY_TRACKING.md](planning/pro-liberty/PRO_LIBERTY_TRACKING.md) | Sprint tracking board | Vision + data sprints + RAG rollout + evaluations | Keeps Values Commitment visible |
| [planning/pro-liberty/PRO_LIBERTY_TEST_STRATEGY.md](planning/pro-liberty/PRO_LIBERTY_TEST_STRATEGY.md) | Alignment test ideas | Values-focused automation & reporting | Prevents drift toward centralization |
| [planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md](planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md) | Alignment regression harness | Concrete automation + UI checks | Keeps Values Commitment alive after training runs |
| [planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md](planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md) | Dataset sprint plan | Batch planning + LoRA training checklist | Guides PRO-LLM-002 execution |
| [../tools/checkpoints/liberty-mistral-v1.0-2026-02-04/README.md](../tools/checkpoints/liberty-mistral-v1.0-2026-02-04/README.md) | Deployment bundle metadata (trimmed run) | References the Values Commitment (`README.md#values-commitment`) and linking assets to `PRO_LIBERTY_TRACKING.md` | Contains historical adapter bundle |
| [../tools/checkpoints/liberty-mistral-v1.0-2026-02-05/README.md](../tools/checkpoints/liberty-mistral-v1.0-2026-02-05/README.md) | Deployment bundle metadata (full run) | Captures the promoted Liberty Mistral adapter along with metadata.json and evaluation notes | Serves as the release-home for the promoted bundle |

### Infrastructure & Operations

| Document | Purpose | Notes |
| --- | --- | --- |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | PostgreSQL schema reference | Tables, relationships, audit logs |
| [INFRASTRUCTURE_SUITE.md](INFRASTRUCTURE_SUITE.md) | Full infrastructure specifications | Docker, ports, networking, volumes |
| [../docker-compose.yml](../docker-compose.yml) | Infrastructure as Code | Single source for service definitions |
| [PERSISTENCE.md](PERSISTENCE.md) | Data persistence & backup strategy | DB connection pooling, backup procedures |
| [SEEDING.md](SEEDING.md) | Database seeding & initialization | Initial data loading, test data generation |

### Standards & Governance

| Document | Purpose | Notes |
| --- | --- | --- |
| [CODING-STANDARDS.md](CODING-STANDARDS.md) | Code quality rules & DTO patterns | Enforced via ESLint & CI gates |
| [GOVERNANCE.md](GOVERNANCE.md) | Policy exceptions & approvals | References PR templates & CODEOWNERS |
| [SECURITY.md](SECURITY.md) | Security review requirements | Before merging security-sensitive PRs |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributor guidelines | Links to CODE_OF_CONDUCT.md |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Community values & conduct | Linked from CONTRIBUTING.md |

### Debugging & Troubleshooting

| Document | Purpose | Location |
| --- | --- | --- |
| [debug/DEBUGGING_QUICK_START.md](debug/DEBUGGING_QUICK_START.md) | Quick debugging tips | Troubleshooting reference |
| [debug/DEBUG_LOGGING_GUIDE.md](debug/DEBUG_LOGGING_GUIDE.md) | Structured logging approach | Developer reference |
| [debug/DEBUG_ERRORS_REFERENCE.md](debug/DEBUG_ERRORS_REFERENCE.md) | Common error messages | Error lookup table |
| [error-handling/INDEX.md](error-handling/INDEX.md) | Error handling documentation hub | Start here |
| [error-handling/FAQ.md](error-handling/FAQ.md) | Quick answers on catch patterns | 5 min read |
| [error-handling/VISUAL_GUIDE.md](error-handling/VISUAL_GUIDE.md) | Visual error handling patterns | Diagrams & examples |
| [error-handling/COMPLETE_ANALYSIS.md](error-handling/COMPLETE_ANALYSIS.md) | Full error handling analysis | 15 min read |
| [error-handling/DEEP_DIVE.md](error-handling/DEEP_DIVE.md) | TypeScript specification details | Technical reference |
| [error-handling/ESLINT_DISABLE.md](error-handling/ESLINT_DISABLE.md) | Why eslint-disable is valid | Pattern validation |
| [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) | Outage response procedure | Operations runbook |

### Technical Deep-Dives & Analysis

| Document | Purpose | Notes |
| --- | --- | --- |
| [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) | Code quality campaign report | 95% improvement: 1860→92 problems (archived) |
| [error-handling/INDEX.md](error-handling/INDEX.md) | Error handling comprehensive guide | Navigation hub |
| [error-handling/COMPLETE_ANALYSIS.md](error-handling/COMPLETE_ANALYSIS.md) | Why unknown types required | Full technical analysis |
| [error-handling/ESLINT_DISABLE.md](error-handling/ESLINT_DISABLE.md) | ESLint suppression patterns | Validation of usage |
| [error-handling/FAQ.md](error-handling/FAQ.md) | Quick reference Q&A | Common questions answered |
| [error-handling/VISUAL_GUIDE.md](error-handling/VISUAL_GUIDE.md) | Visual error patterns | Type safety guide |
| [DATA_MODELING.md](DATA_MODELING.md) | DTO design patterns | References SHARED_DTO_PATTERN.md |
| [SHARED_DTO_PATTERN.md](SHARED_DTO_PATTERN.md) | Shared TypeScript DTO library | Implementation reference |
| [DTO_ENDPOINTS_REGISTRY.md](DTO_ENDPOINTS_REGISTRY.md) | DTO to endpoint mapping | Audit trail for API contracts |
| [CORS_WEBSOCKET_FIX.md](CORS_WEBSOCKET_FIX.md) | CORS + WebSocket configuration | Fixed 2026-02-01 21:50 UTC |
| [SOCKET-SERVICES.md](SOCKET-SERVICES.md) | Socket.IO architecture | Telemetry gateway details |
| [TRACING.md](TRACING.md) | Distributed tracing setup | Observability reference |
| [VITEST-MIGRATION.md](VITEST-MIGRATION.md) | Vitest migration guide | Testing framework reference |
| [LLM_TUNING_AND_RAG.md](LLM_TUNING_AND_RAG.md) | Advanced LLM optimization | LoRA, RAG techniques |
| [METRICS.md](METRICS.md) | KPI definitions & tracking | Performance monitoring |
| [FINAL_REQUIREMENTS.md](FINAL_REQUIREMENTS.md) | Original requirements (archived) | Historical reference |
| [FRONTEND_UI_REQUIREMENTS.md](FRONTEND_UI_REQUIREMENTS.md) | UI/UX specifications | Component reference |

### Archived Files (Keep for reference only)

| Document | Status | Reason | Notes |
| --- | --- | --- | --- |
| [CHANGES_SUMMARY.md](CHANGES_SUMMARY.md) | 🟡 ARCHIVED | Use ../TODO.md for sprint history | Contains early debug work from 2026-02-02 |
| [FINAL_REQUIREMENTS.md](FINAL_REQUIREMENTS.md) | 🟡 ARCHIVED | Reference only | Original requirements before 2026-02-03 sprint |

---

## Cross-Reference Guide

### When you need information about

### 🚀 System Status

1. START: [../README.md](../README.md) – "Status at a Glance" section
2. THEN: [../PROJECT_STATUS.md](../PROJECT_STATUS.md) – Full verification details
3. THEN: [../TODO.md](../TODO.md) – Sprint progress tracking

### 🏗️ Architecture

1. START: [OVERVIEW.md](OVERVIEW.md) – High-level overview
2. THEN: [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md) – Service details
3. THEN: [../docker-compose.yml](../docker-compose.yml) – Infrastructure as Code
4. DEEP: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) – DB structure

### 💻 Code Quality & Standards

1. START: [CODING-STANDARDS.md](CODING-STANDARDS.md) – Rules & patterns
2. THEN: [../linting-summary.txt](../linting-summary.txt) – Current metrics
3. DEEP: [SHARED_DTO_PATTERN.md](SHARED_DTO_PATTERN.md) – DTO implementation

### 🤖 LLM Development

1. START: [LLM/MODEL-CHARTER.md](LLM/MODEL-CHARTER.md) – Constitutional values
2. THEN: [LLM/LLM-CREATION.md](LLM/LLM-CREATION.md) – Training steps
3. THEN: [LLM/EVALUATION-CHECKLIST.md](LLM/EVALUATION-CHECKLIST.md) – Quality criteria
4. DATA: [LLM/TRAINING-DATA-SOURCES.md](LLM/TRAINING-DATA-SOURCES.md) – Data curation

### 🔌 API Integration

1. START: [api/QUICK_REFERENCE.md](api/QUICK_REFERENCE.md) – Endpoints list
2. EXAMPLES: [api/EXAMPLES.md](api/EXAMPLES.md) – Code samples
3. GUIDE: [api/GUIDE.md](api/GUIDE.md) – Detailed usage
4. FULL: [api/ENDPOINTS_SUMMARY.md](api/ENDPOINTS_SUMMARY.md) – All details

### 🔒 Security & Governance

1. START: [SECURITY.md](SECURITY.md) – Security requirements
2. POLICY: [GOVERNANCE.md](GOVERNANCE.md) – Exception approvals
3. CONDUCT: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) – Community norms

### 🐛 Debugging Issues

1. START: [debug/DEBUGGING_QUICK_START.md](debug/DEBUGGING_QUICK_START.md) – Quick tips
2. ERRORS: [debug/DEBUG_ERRORS_REFERENCE.md](debug/DEBUG_ERRORS_REFERENCE.md) – Error lookup
3. LOGS: [debug/DEBUG_LOGGING_GUIDE.md](debug/DEBUG_LOGGING_GUIDE.md) – Structured logging
4. OUTAGE: [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) – Runbook

### ⚡ Operations & Deployment

1. START: [INFRASTRUCTURE_SUITE.md](INFRASTRUCTURE_SUITE.md) – Full infrastructure
2. DB: [PERSISTENCE.md](PERSISTENCE.md) – Data persistence
3. INIT: [SEEDING.md](SEEDING.md) – DB initialization
4. INCIDENT: [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) – Outage response

---

## Redundancy Elimination Strategy

### Already Addressed

| Issue | Solution | Status |
| --- | --- | --- |
| Overlapping status info | README, TODO, PROJECT_STATUS now have clear distinct roles | ✅ |
| Duplicate architecture docs | OVERVIEW as primary; MICROSERVICES_ARCHITECTURE for details | ✅ |
| Multiple sprint trackers | TODO.md now primary; CHANGES_SUMMARY.md archived | ✅ |
| Old requirement docs | FINAL_REQUIREMENTS.md marked as archived reference | ✅ |
| Documentation centralization | DOCUMENTATION_MAP.md moved to documentation/ folder (2026-02-03) | ✅ |

### To Be Addressed

| Issue | Action | Owner | Target |
| --- | --- | --- | --- |
| Duplicate "how to run" instructions | Consolidate into README & OVERVIEW | DevOps | Sprint 2 |
| Multiple linting reports | Keep only linting-summary.txt (others archived) | DevOps | Sprint 2 |
| Scattered configuration docs | Link all config changes to README.md | DevOps | Sprint 2 |
| Backend API test coverage | Complete comprehensive Inference/Analytics/Health tests | Engineering | Sprint 2 |

---

## Quick Navigation

**🚀 Just Getting Started?**
→ [../README.md](../README.md)

**🏗️ Understanding the System?**
→ [OVERVIEW.md](OVERVIEW.md)

**🔍 Checking System Status?**
→ [../PROJECT_STATUS.md](../PROJECT_STATUS.md)

**📋 Tracking Sprint Progress?**
→ [../TODO.md](../TODO.md)

**💬 Writing Code?**
→ [CODING-STANDARDS.md](CODING-STANDARDS.md)

**🤖 Building LLM?**
→ [LLM/MODEL-CHARTER.md](LLM/MODEL-CHARTER.md)

**🔌 Using the API?**
→ [api/QUICK_REFERENCE.md](api/QUICK_REFERENCE.md)

**🐛 Debugging?**
→ [debug/DEBUGGING_QUICK_START.md](debug/DEBUGGING_QUICK_START.md)

**📈 Testing Strategy?**
→ [../TODO.md](../TODO.md) (see "Backend API Test Coverage" in progress)

---

_This map ensures no duplicate information across 55 markdown files and establishes single sources of truth for each domain. Moved to documentation/ folder on 2026-02-03 22:15 UTC for centralized reference. Update whenever new documentation is created or old documentation is consolidated._
