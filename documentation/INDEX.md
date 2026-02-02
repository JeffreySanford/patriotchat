# ��� Documentation Index

**Repository:** PatriotChat  
**Updated:** 2026-02-02

---

## ��� Quick Start

| Need | Location |
| --- | --- |
| **Start here** | [../README.md](../README.md) |
| **Current tasks** | [../TODO.md](../TODO.md) |
| **Legendary V2 overview** | [INFRASTRUCTURE_SUITE.md](INFRASTRUCTURE_SUITE.md) |
| **API reference** | [api/GUIDE.md](api/GUIDE.md) |
| **Debugging** | [debug/DEBUGGING_QUICK_START.md](debug/DEBUGGING_QUICK_START.md) |
| **Contributing** | [CONTRIBUTING.md](CONTRIBUTING.md) |

---

## ��� By Category

### Legendary V2 Infrastructure

- [INFRASTRUCTURE_SUITE.md](INFRASTRUCTURE_SUITE.md) - Master overview & roadmap
- [MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md) - **NEW:** Microservices architecture with API gateway, services, and deployment
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - **NEW:** PostgreSQL schema with audit trails, data provenance, scrubbing strategy
- [FRONTEND_UI_REQUIREMENTS.md](FRONTEND_UI_REQUIREMENTS.md) - **NEW:** Frontend UI with LLM model selector, rate limits, audit trail viewer
- [PERSISTENCE.md](PERSISTENCE.md) - MongoDB design patterns
- [DATA_MODELING.md](DATA_MODELING.md) - Type safety & models
- [TRACING.md](TRACING.md) - Distributed tracing setup
- [SEEDING.md](SEEDING.md) - Test data strategy
- [LLM_TUNING_AND_RAG.md](LLM_TUNING_AND_RAG.md) - LLM & RAG strategy

### API Reference

- [api/GUIDE.md](api/GUIDE.md) - Full API documentation
- [api/EXAMPLES.md](api/EXAMPLES.md) - Request/response examples
- [api/ENDPOINTS_SUMMARY.md](api/ENDPOINTS_SUMMARY.md) - Quick endpoint list

### LLM Systems

- [LLM/ARCHITECTURE.md](LLM/ARCHITECTURE.md) - LLM architecture
- [LLM/LLM-CREATION.md](LLM/LLM-CREATION.md) - Creating LLM instances
- [LLM/TRAINING-DATA-SOURCES.md](LLM/TRAINING-DATA-SOURCES.md) - Training data

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

## ��� Start by Role

| Role | Read First | Then |
| --- | --- | --- |
| **Backend Dev** | [../MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md) | [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) → Go service scaffolding |
| **DevOps** | [../MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md) | Docker setup → Service health checks |
| **Frontend Dev** | [FRONTEND_UI_REQUIREMENTS.md](FRONTEND_UI_REQUIREMENTS.md) | [../MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md) → Component implementation |
| **ML Engineer** | [LLM_TUNING_AND_RAG.md](LLM_TUNING_AND_RAG.md) | [LLM/](LLM/) folder → Mistral fine-tuning |
| **QA/Tester** | [../MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md) | [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) → Test data seeding |
| **Newcomer** | [../README.md](../README.md) | [../MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md) → Pick a service to learn |

---

**Last Updated:** 2026-02-02
