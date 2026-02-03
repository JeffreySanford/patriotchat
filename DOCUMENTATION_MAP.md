# Documentation Map – Single Source of Truth Hierarchy

_Updated 2026-02-03 12:30 UTC · Establishes clear ownership and reduces redundancy across all 55 markdown files_

## Documentation Hierarchy & Ownership

### Primary Sources of Truth

These files are the authoritative source for their respective domains. All other documentation should reference these when covering the same topics.

| Document | Primary Purpose | Owner | When to Update |
| --- | --- | --- | --- |
| [README.md](README.md) | **Quick Start & Status Overview** | DevOps/PM | After each sprint (status updates); after infrastructure changes |
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | **Critical Requirements Verification** | QA/Product | After verification runs; after requirement changes |
| [TODO.md](TODO.md) | **Sprint Status & AGILE Tracking** | Tech Lead | After each status shift; before/after sprint planning |
| [documentation/OVERVIEW.md](documentation/OVERVIEW.md) | **System Architecture & Development Workflow** | Architects | After architectural decisions; after workflow process changes |
| [documentation/MICROSERVICES_ARCHITECTURE.md](documentation/MICROSERVICES_ARCHITECTURE.md) | **Detailed Service Specifications** | Backend Lead | After service changes; after protocol updates |
| [documentation/CODING-STANDARDS.md](documentation/CODING-STANDARDS.md) | **Code Quality & Standards** | Tech Lead | After standards updates; after linting campaign completions |
| [documentation/api/QUICK_REFERENCE.md](documentation/api/QUICK_REFERENCE.md) | **API Endpoints Quick Lookup** | API Owner | After endpoint changes; after version updates |
| [documentation/LLM/MODEL-CHARTER.md](documentation/LLM/MODEL-CHARTER.md) | **LLM Constitutional Values & Principles** | LLM Lead | After constitutional values updates |
| [linting-summary.txt](linting-summary.txt) | **Current Linting Metrics** | DevOps | After each linting campaign phase |

---

## Reference & Supporting Documentation

These files provide detailed reference material and should link back to primary sources where applicable.

### API Documentation

| Document | Purpose | Replaces/Refs | Notes |
| --- | --- | --- | --- |
| [documentation/api/INDEX.md](documentation/api/INDEX.md) | API navigation hub | — | Links to all API docs; keep updated |
| [documentation/api/GUIDE.md](documentation/api/GUIDE.md) | Detailed API usage guide | Detailed how-to references | Examples for each endpoint family |
| [documentation/api/EXAMPLES.md](documentation/api/EXAMPLES.md) | Copy-paste API examples | Practical code samples | cURL + client library examples |
| [documentation/api/ENDPOINTS_SUMMARY.md](documentation/api/ENDPOINTS_SUMMARY.md) | All endpoints with descriptions | Endpoint reference | Supplements QUICK_REFERENCE.md |

### LLM Documentation

| Document | Purpose | Scope | Notes |
| --- | --- | --- | --- |
| [documentation/LLM/MODEL-CHARTER.md](documentation/LLM/MODEL-CHARTER.md) | Constitutional values & guardrails | Constitutional Experiment Assistant | Primary LLM governance document |
| [documentation/LLM/LLM-CREATION.md](documentation/LLM/LLM-CREATION.md) | Step-by-step LLM training guide | Training workflow | References TRAINING-DATA-SOURCES.md |
| [documentation/LLM/TRAINING-DATA-SOURCES.md](documentation/LLM/TRAINING-DATA-SOURCES.md) | Recommended data sources | Dataset curation | Unbiased civic data recommendations |
| [documentation/LLM/EVALUATION-CHECKLIST.md](documentation/LLM/EVALUATION-CHECKLIST.md) | Model quality criteria | Evaluation framework | Bias, alignment, performance checks |
| [documentation/LLM/PHILOSOPHICAL-NOTES.md](documentation/LLM/PHILOSOPHICAL-NOTES.md) | Reflections on bias & values | Context & rationale | Historical & philosophical context |
| [documentation/LLM/TESTING-PLAN.md](documentation/LLM/TESTING-PLAN.md) | QA strategy for LLM | Test methodology | Integration, unit, bias testing |
| [documentation/LLM/ARCHITECTURE.md](documentation/LLM/ARCHITECTURE.md) | LLM system components | Detailed architecture | References MICROSERVICES_ARCHITECTURE.md |

### Infrastructure & Operations

| Document | Purpose | Notes |
| --- | --- | --- |
| [documentation/DATABASE_SCHEMA.md](documentation/DATABASE_SCHEMA.md) | PostgreSQL schema reference | Tables, relationships, audit logs |
| [documentation/INFRASTRUCTURE_SUITE.md](documentation/INFRASTRUCTURE_SUITE.md) | Full infrastructure specifications | Docker, ports, networking, volumes |
| [docker-compose.yml](docker-compose.yml) | Infrastructure as Code | Single source for service definitions |
| [documentation/PERSISTENCE.md](documentation/PERSISTENCE.md) | Data persistence & backup strategy | DB connection pooling, backup procedures |
| [documentation/SEEDING.md](documentation/SEEDING.md) | Database seeding & initialization | Initial data loading, test data generation |

### Standards & Governance

| Document | Purpose | Notes |
| --- | --- | --- |
| [documentation/CODING-STANDARDS.md](documentation/CODING-STANDARDS.md) | Code quality rules & DTO patterns | Enforced via ESLint & CI gates |
| [documentation/GOVERNANCE.md](documentation/GOVERNANCE.md) | Policy exceptions & approvals | References PR templates & CODEOWNERS |
| [documentation/SECURITY.md](documentation/SECURITY.md) | Security review requirements | Before merging security-sensitive PRs |
| [documentation/CONTRIBUTING.md](documentation/CONTRIBUTING.md) | Contributor guidelines | Links to CODE_OF_CONDUCT.md |
| [documentation/CODE_OF_CONDUCT.md](documentation/CODE_OF_CONDUCT.md) | Community values & conduct | Linked from CONTRIBUTING.md |

### Debugging & Troubleshooting

| Document | Purpose | Location |
| --- | --- | --- |
| [documentation/debug/DEBUGGING_QUICK_START.md](documentation/debug/DEBUGGING_QUICK_START.md) | Quick debugging tips | Troubleshooting reference |
| [documentation/debug/DEBUG_LOGGING_GUIDE.md](documentation/debug/DEBUG_LOGGING_GUIDE.md) | Structured logging approach | Developer reference |
| [documentation/debug/DEBUG_ERRORS_REFERENCE.md](documentation/debug/DEBUG_ERRORS_REFERENCE.md) | Common error messages | Error lookup table |
| [documentation/INCIDENT_RESPONSE.md](documentation/INCIDENT_RESPONSE.md) | Outage response procedure | Operations runbook |

### Technical Deep-Dives

| Document | Purpose | Notes |
| --- | --- | --- |
| [documentation/DATA_MODELING.md](documentation/DATA_MODELING.md) | DTO design patterns | References SHARED_DTO_PATTERN.md |
| [documentation/SHARED_DTO_PATTERN.md](documentation/SHARED_DTO_PATTERN.md) | Shared TypeScript DTO library | Implementation reference |
| [documentation/DTO_ENDPOINTS_REGISTRY.md](documentation/DTO_ENDPOINTS_REGISTRY.md) | DTO to endpoint mapping | Audit trail for API contracts |
| [documentation/CORS_WEBSOCKET_FIX.md](documentation/CORS_WEBSOCKET_FIX.md) | CORS + WebSocket configuration | Fixed 2026-02-01 21:50 UTC |
| [documentation/SOCKET-SERVICES.md](documentation/SOCKET-SERVICES.md) | Socket.IO architecture | Telemetry gateway details |
| [documentation/TRACING.md](documentation/TRACING.md) | Distributed tracing setup | Observability reference |
| [documentation/VITEST-MIGRATION.md](documentation/VITEST-MIGRATION.md) | Vitest migration guide | Testing framework reference |
| [documentation/LLM_TUNING_AND_RAG.md](documentation/LLM_TUNING_AND_RAG.md) | Advanced LLM optimization | LoRA, RAG techniques |
| [documentation/METRICS.md](documentation/METRICS.md) | KPI definitions & tracking | Performance monitoring |
| [documentation/FINAL_REQUIREMENTS.md](documentation/FINAL_REQUIREMENTS.md) | Original requirements (archived) | Historical reference |
| [documentation/FRONTEND_UI_REQUIREMENTS.md](documentation/FRONTEND_UI_REQUIREMENTS.md) | UI/UX specifications | Component reference |

### Deprecated or Archived Files (Keep for reference only)

| Document | Status | Reason | Notes |
| --- | --- | --- | --- |
| [CHANGES_SUMMARY.md](documentation/CHANGES_SUMMARY.md) | 🟡 ARCHIVED | Use TODO.md for sprint history | Contains early debug work from 2026-02-02 |
| [INTEGRATION_TEST_RESULTS.md](INTEGRATION_TEST_RESULTS.md) | 🟡 ARCHIVED | Superseded by CI logs | Keep for historical reference |
| [linting-report-final.txt](linting-report-final.txt) | 🟡 ARCHIVED | Use linting-summary.txt | Pre-campaign baseline |
| [linting-report.txt](linting-report.txt) | 🟡 ARCHIVED | Use linting-summary.txt | Intermediate snapshot |

---

## Cross-Reference Guide

### When you need information about

**🚀 System Status**

1. START: [README.md](README.md) – "Status at a Glance" section
2. THEN: [PROJECT_STATUS.md](PROJECT_STATUS.md) – Full verification details
3. THEN: [TODO.md](TODO.md) – Sprint progress tracking

**🏗️ Architecture**

1. START: [documentation/OVERVIEW.md](documentation/OVERVIEW.md) – High-level overview
2. THEN: [documentation/MICROSERVICES_ARCHITECTURE.md](documentation/MICROSERVICES_ARCHITECTURE.md) – Service details
3. THEN: [docker-compose.yml](docker-compose.yml) – Infrastructure as Code
4. DEEP: [documentation/DATABASE_SCHEMA.md](documentation/DATABASE_SCHEMA.md) – DB structure

**💻 Code Quality & Standards**

1. START: [documentation/CODING-STANDARDS.md](documentation/CODING-STANDARDS.md) – Rules & patterns
2. THEN: [linting-summary.txt](linting-summary.txt) – Current metrics
3. DEEP: [documentation/SHARED_DTO_PATTERN.md](documentation/SHARED_DTO_PATTERN.md) – DTO implementation

**🤖 LLM Development**

1. START: [documentation/LLM/MODEL-CHARTER.md](documentation/LLM/MODEL-CHARTER.md) – Constitutional values
2. THEN: [documentation/LLM/LLM-CREATION.md](documentation/LLM/LLM-CREATION.md) – Training steps
3. THEN: [documentation/LLM/EVALUATION-CHECKLIST.md](documentation/LLM/EVALUATION-CHECKLIST.md) – Quality criteria
4. DATA: [documentation/LLM/TRAINING-DATA-SOURCES.md](documentation/LLM/TRAINING-DATA-SOURCES.md) – Data curation

**🔌 API Integration**

1. START: [documentation/api/QUICK_REFERENCE.md](documentation/api/QUICK_REFERENCE.md) – Endpoints list
2. EXAMPLES: [documentation/api/EXAMPLES.md](documentation/api/EXAMPLES.md) – Code samples
3. GUIDE: [documentation/api/GUIDE.md](documentation/api/GUIDE.md) – Detailed usage
4. FULL: [documentation/api/ENDPOINTS_SUMMARY.md](documentation/api/ENDPOINTS_SUMMARY.md) – All details

**🔒 Security & Governance**

1. START: [documentation/SECURITY.md](documentation/SECURITY.md) – Security requirements
2. POLICY: [documentation/GOVERNANCE.md](documentation/GOVERNANCE.md) – Exception approvals
3. CONDUCT: [documentation/CODE_OF_CONDUCT.md](documentation/CODE_OF_CONDUCT.md) – Community norms

**🐛 Debugging Issues**

1. START: [documentation/debug/DEBUGGING_QUICK_START.md](documentation/debug/DEBUGGING_QUICK_START.md) – Quick tips
2. ERRORS: [documentation/debug/DEBUG_ERRORS_REFERENCE.md](documentation/debug/DEBUG_ERRORS_REFERENCE.md) – Error lookup
3. LOGS: [documentation/debug/DEBUG_LOGGING_GUIDE.md](documentation/debug/DEBUG_LOGGING_GUIDE.md) – Structured logging
4. OUTAGE: [documentation/INCIDENT_RESPONSE.md](documentation/INCIDENT_RESPONSE.md) – Runbook

**⚡ Operations & Deployment**

1. START: [documentation/INFRASTRUCTURE_SUITE.md](documentation/INFRASTRUCTURE_SUITE.md) – Full infrastructure
2. DB: [documentation/PERSISTENCE.md](documentation/PERSISTENCE.md) – Data persistence
3. INIT: [documentation/SEEDING.md](documentation/SEEDING.md) – DB initialization
4. INCIDENT: [documentation/INCIDENT_RESPONSE.md](documentation/INCIDENT_RESPONSE.md) – Outage response

---

## Redundancy Elimination Strategy

### Already Addressed

| Issue | Solution | Status |
| --- | --- | --- |
| Overlapping status info | README, TODO, PROJECT_STATUS now have clear distinct roles | ✅ |
| Duplicate architecture docs | OVERVIEW as primary; MICROSERVICES_ARCHITECTURE for details | ✅ |
| Multiple sprint trackers | TODO.md now primary; CHANGES_SUMMARY.md archived | ✅ |
| Old requirement docs | FINAL_REQUIREMENTS.md marked as archived reference | ✅ |

### To Be Addressed

| Issue | Action | Owner | Target |
| --- | --- | --- | --- |
| Duplicate "how to run" instructions | Consolidate into README & OVERVIEW | DevOps | Sprint 2 |
| Multiple linting reports | Keep only linting-summary.txt | DevOps | Sprint 2 |
| Old integration test results | Move to CI logs; keep only recent results | QA | Sprint 2 |
| Scattered configuration docs | Link all config changes to README.md | DevOps | Sprint 2 |

---

## Quick Navigation

**🚀 Just Getting Started?**
→ [README.md](README.md)

**🏗️ Understanding the System?**
→ [documentation/OVERVIEW.md](documentation/OVERVIEW.md)

**🔍 Checking System Status?**
→ [PROJECT_STATUS.md](PROJECT_STATUS.md)

**📋 Tracking Sprint Progress?**
→ [TODO.md](TODO.md)

**💬 Writing Code?**
→ [documentation/CODING-STANDARDS.md](documentation/CODING-STANDARDS.md)

**🤖 Building LLM?**
→ [documentation/LLM/MODEL-CHARTER.md](documentation/LLM/MODEL-CHARTER.md)

**🔌 Using the API?**
→ [documentation/api/QUICK_REFERENCE.md](documentation/api/QUICK_REFERENCE.md)

**🐛 Debugging?**
→ [documentation/debug/DEBUGGING_QUICK_START.md](documentation/debug/DEBUGGING_QUICK_START.md)

---

_This map ensures no duplicate information across 55 markdown files and establishes single sources of truth for each domain. Update whenever new documentation is created or old documentation is consolidated._
