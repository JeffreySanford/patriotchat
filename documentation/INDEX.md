# 📚 Documentation Index

**Repository:** PatriotChat  
**Updated:** 2026-02-04

---

## 🚀 Quick Start

| Need | Location |
| --- | --- |
| **Start here** | [../README.md](../README.md) |
| **Current tasks** | [../TODO.md](../TODO.md) |
| **Architecture** | [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md) |
| **Type Safety (NEW)** | [SHARED_DTO_PATTERN.md](SHARED_DTO_PATTERN.md) |
| **API reference** | [api/GUIDE.md](api/GUIDE.md) |
| **Debugging** | [debug/DEBUGGING_QUICK_START.md](debug/DEBUGGING_QUICK_START.md) |
| **Contributing** | [CONTRIBUTING.md](CONTRIBUTING.md) |

---

## 📖 By Category

### Type Safety & Shared DTOs ⭐ NEW

- [SHARED_DTO_PATTERN.md](SHARED_DTO_PATTERN.md) - **End-to-end type safety architecture** with shared DTOs
  - Pattern hierarchy visualization
  - DTO enforcement rules
  - Adding new endpoints checklist
  - Common patterns (List, Create, etc.)

- [DTO_ENDPOINTS_REGISTRY.md](DTO_ENDPOINTS_REGISTRY.md) - **Complete endpoint-to-DTO mapping**
  - All current endpoints documented
  - Request/response examples
  - Type safety flow diagrams
  - Adding new endpoints checklist
  - Implementation patterns

### Microservices Architecture & Requirements

- [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md) - Full microservices pattern with 6 services + gateway
- [FINAL_REQUIREMENTS.md](FINAL_REQUIREMENTS.md) - All 5 requirements finalized (performance, audit, database, LLM, rate limiting)
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - PostgreSQL schema with audit trails, data provenance, scrubbing
- [FRONTEND_UI_REQUIREMENTS.md](FRONTEND_UI_REQUIREMENTS.md) - UI spec with LLM model selector, rate limits, audit viewer

### API Reference

- [api/GUIDE.md](api/GUIDE.md) - Full API documentation
- [api/EXAMPLES.md](api/EXAMPLES.md) - Request/response examples
- [api/ENDPOINTS_SUMMARY.md](api/ENDPOINTS_SUMMARY.md) - Quick endpoint list

### LLM Systems

- [LLM/ARCHITECTURE.md](LLM/ARCHITECTURE.md) - LLM architecture
- [LLM/LLM-CREATION.md](LLM/LLM-CREATION.md) - Creating LLM instances
- [LLM/TRAINING-DATA-SOURCES.md](LLM/TRAINING-DATA-SOURCES.md) - Training data
- [planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md](planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md) - Pro-liberty roadmap, schema, config, and Constitution-first RAG setup
- [planning/pro-liberty/PRO_LIBERTY_TRACKING.md](planning/pro-liberty/PRO_LIBERTY_TRACKING.md) - Sprint tracking board for the pro-liberty implementation plan
- [planning/pro-liberty/PRO_LIBERTY_TEST_STRATEGY.md](planning/pro-liberty/PRO_LIBERTY_TEST_STRATEGY.md) - Alignment-focused test ideas to prevent drift
- [planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md](planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md) - Regression ideas + automation for Values Commitment alignment
- [planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md](planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md) - Batch-level dataset sprint plan for PRO-LLM-002

### Project Standards

- [CODING-STANDARDS.md](CODING-STANDARDS.md) - Code quality standards
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [SECURITY.md](SECURITY.md) - Security guidelines
- [GOVERNANCE.md](GOVERNANCE.md) - Project governance

### Debugging

- [debug/DEBUGGING_QUICK_START.md](debug/DEBUGGING_QUICK_START.md) - Start debugging
- [debug/DEBUG_LOGGING_GUIDE.md](debug/DEBUG_LOGGING_GUIDE.md) - Logging reference
- [debug/DEBUG_ERRORS_REFERENCE.md](debug/DEBUG_ERRORS_REFERENCE.md) - Error solutions

### Architecture & Operations

- [OVERVIEW.md](OVERVIEW.md) - System overview
- [SOCKET-SERVICES.md](SOCKET-SERVICES.md) - WebSocket architecture
- [METRICS.md](METRICS.md) - Monitoring & metrics
- [INCIDENT_RESPONSE.md](INCIDENT_RESPONSE.md) - Incident procedures
- [VITEST-MIGRATION.md](VITEST-MIGRATION.md) - Testing framework

---

## 👥 Start by Role

| Role | Read First | Then |
| --- | --- | --- |
| **Backend Dev** | [SHARED_DTO_PATTERN.md](SHARED_DTO_PATTERN.md) | [DTO_ENDPOINTS_REGISTRY.md](DTO_ENDPOINTS_REGISTRY.md) → [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md) |
| **Frontend Dev** | [SHARED_DTO_PATTERN.md](SHARED_DTO_PATTERN.md) | [DTO_ENDPOINTS_REGISTRY.md](DTO_ENDPOINTS_REGISTRY.md) → [FRONTEND_UI_REQUIREMENTS.md](FRONTEND_UI_REQUIREMENTS.md) |
| **DevOps** | [MICROSERVICES_ARCHITECTURE.md](MICROSERVICES_ARCHITECTURE.md) | Docker setup → Service health checks |
| **ML Engineer** | [LLM_TUNING_AND_RAG.md](LLM_TUNING_AND_RAG.md) | [LLM/](LLM/) folder → Mistral fine-tuning |
| **QA/Tester** | [SHARED_DTO_PATTERN.md](SHARED_DTO_PATTERN.md) | [DTO_ENDPOINTS_REGISTRY.md](DTO_ENDPOINTS_REGISTRY.md) → Test data seeding |
| **Newcomer** | [../README.md](../README.md) | [SHARED_DTO_PATTERN.md](SHARED_DTO_PATTERN.md) → Pick a service to learn |

---

## ✅ Key Accomplishments

### Type Safety Achievement (Feb 2026)

- **Shared DTO Library** (`@patriotchat/shared`) - Single source of truth for API contracts
- **Backend Interceptors** - ErrorInterceptor + ResponseInterceptor ensure typed responses
- **Frontend Interceptor** - ApiInterceptor validates all HTTP responses
- **ESLint Reduced** - From 310 issues → 90 warnings (0 errors) ✅
- **Both Builds Pass** - API Gateway + Frontend compile with full type safety ✅

---

**Last Updated:** 2026-02-03
