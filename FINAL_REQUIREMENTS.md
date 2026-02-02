# Final Requirements Summary

**Date:** February 2, 2026  
**Phase:** Architecture Finalization  
**Status:** ✅ APPROVED - Ready for Implementation

---

## Executive Summary

All critical requirements gathered and finalized for PatriotChat V2 microservices architecture. System designed for:

- **Auditability:** Immutable audit trails + user-visible scrubbed data
- **Security:** Multi-dimensional rate limiting (IP + user + endpoint + tier)
- **Performance:** < 100ms Auth, < 500ms heavy operations
- **AI:** Fine-tuned Mistral LLM with optional 3-model selector
- **Database:** PostgreSQL ACID guarantees for data integrity

---

## ✅ Five Critical Requirements (APPROVED)

### 1. Performance Target

**Answer:** MVP good start (< 100ms Auth, < 500ms heavy)

**Implementation:**

- OpenTelemetry distributed tracing from day 1
- Monitor latency per endpoint
- Alert if Auth > 100ms, others > 500ms
- Reference: [MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md)

---

### 2. Audit Trail Visibility

**Answer:** Internal + eventual user-visible scrubbed data + API responses

**Implementation:**

- **Internal:** Full audit_logs table with all changes, PII, IP addresses
- **User-Visible:** Scrubbed audit trail via `/api/audit/my-activity` endpoint
- **API Response:** Include metadata (who changed, when, what)
- **Privacy:** PII removed before showing to users
- **Database:** PostgreSQL audit tables with immutable constraints
- Reference: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

### 3. Database Strategy

**Answer:** PostgreSQL (not MongoDB) - all services

**Implementation:**

- PostgreSQL 16+ for all services
- Shared database with role-based access
- ACID guarantees for audit trail integrity
- JSONB support for flexible data
- Temporal tables for versioning
- Append-only audit logs (immutable)
- Reference: [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

---

### 4. LLM Model

**Answer:** Mistral (fine-tuned) + optional 3-model selector if easy

**Implementation:**

- Primary model: Mistral (fine-tuned locally)
- No external APIs (no OpenAI/Grok)
- Optional: 3-model dropdown in UI (if common patterns)
  - Mistral (default)
  - Mistral Variant 2 (policy optimized)
  - Mistral Variant 3 (funding optimized)
- Model selector easily implemented (2-3 hours)
- Include in frontend UI requirements
- Reference: [FRONTEND_UI_REQUIREMENTS.md](FRONTEND_UI_REQUIREMENTS.md)

---

### 5. Rate Limiting Strategy

**Answer:** Free + Power + Premium tiers with multi-dimensional limits

**Implementation:**

- **Per IP:** 1K (free), 5K (power), 10K (premium) req/min
- **Per User/API Key:** 100 (free), 10K (power), 100K (premium) req/hour
- **Per Endpoint:**
  - Auth/register: 5 req/min (spam prevention)
  - Auth/login: 10 req/min (brute force prevention)
  - LLM query: Varies by tier
  - Funding search: 30 req/min (external API rate limits)
- **Per Tier:**
  - Free: 100 req/hour total, 1 LLM query/min
  - Power: 10K req/hour total, 10 LLM queries/min
  - Premium: 100K req/hour total, 100 LLM queries/min
- Implementation: Gateway rate limiter with Redis backend
- Headers: Return `X-RateLimit-*` in responses
- Reference: [MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md)

---

## Architecture Summary

### Services (All containerized)

| Service | Port | Language | Role |
| --- | --- | --- | --- |
| **API Gateway** | 3000 | NestJS | Entry point, routing, rate limiting, auth |
| **Auth Service** | 4001 | Go | JWT, OAuth, session management |
| **Funding Service** | 4002 | Go | FEC, ProPublica data aggregation |
| **Policy Service** | 4003 | Go | Policy management, versioning |
| **LLM Service** | 4004 | Go | Mistral fine-tuned inference |
| **Analytics Service** | 4005 | Go | Metrics, reports, trends |
| **Frontend** | 4200 | Angular | SPA with Material Design 3 |
| **Database** | 5432 | PostgreSQL | Audit trails, all data |

### Technology Stack

- **Frontend:** Angular 21.1.0 + Angular Material 21.1.0 + ngrx/component-store
- **Gateway:** NestJS 11.0.0 (TypeScript)
- **Microservices:** Go 1.21
- **Database:** PostgreSQL 16
- **Container:** Docker + docker-compose
- **Testing:** Vitest (unit/integration) + curl (E2E)
- **Monitoring:** OpenTelemetry + Jaeger/Zipkin
- **State Management:** ngrx/component-store (frontend)

### Key Design Patterns

1. **Auditability First**
   - Append-only audit_logs table (immutable)
   - All changes tracked: old_value, new_value, diff
   - User-visible scrubbed audit trail
   - Correlation IDs for request tracing

2. **Security-First**
   - Service-to-service authentication (internal JWT)
   - Multi-dimensional rate limiting
   - Health checks & readiness probes
   - Environment variables for secrets

3. **Observable Systems**
   - OpenTelemetry from first service
   - Distributed tracing with correlation IDs
   - Structured JSON logging
   - Metrics collection (Prometheus)

4. **Data Provenance**
   - Track who changed what, when, why
   - User attribution flows
   - Immutable audit trail
   - Scrubbed user-visible data

---

## Implementation Roadmap

### Phase 1: Auth Service (Foundation)

- Scaffold Go service
- JWT token generation/validation
- User registration/login
- Audit logging for all changes
- Health checks & metrics
- Unit tests (in-memory)
- Integration tests (real DB)
- E2E tests (curl)

### Phase 2: API Gateway (Entry Point)

- NestJS gateway
- Service proxying
- Rate limiting (Redis)
- Auth guards
- Request/response transformation
- CORS & security headers

### Phase 3-5: Domain Services

- Funding Service (Go)
- Policy Service (Go)
- LLM Service (Mistral) with optional model selector
- Analytics Service (Go)
- Each with audit logging, health checks, tests

### Phase 6: Frontend UI

- Angular SPA
- Login/registration
- Dashboard
- Funding explorer
- Query interface (with LLM model selector)
- Audit trail viewer
- Settings & account management

### Phase 7: Integration & Polish

- Service-to-service communication
- Complete E2E flows
- Performance optimization
- Documentation
- Deployment strategy

---

## Documentation Created/Updated

### NEW Documents

1. [MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md)
   - Service definitions, communication patterns
   - Docker deployment, development workflow
   - Rate limiting strategy (4 dimensions)
   - Database design with audit trails

2. [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
   - PostgreSQL tables: users, audit_logs, policies, funding_data, etc.
   - Immutable audit log constraints
   - Data scrubbing strategy
   - Query patterns for audit trails
   - GDPR compliance notes

3. [FRONTEND_UI_REQUIREMENTS.md](FRONTEND_UI_REQUIREMENTS.md)
   - Page layouts: auth, dashboard, explorer, query interface
   - LLM model selector dropdown (NEW)
   - Rate limit display
   - Audit trail viewer
   - Material Design 3 components
   - Responsive design & accessibility

### UPDATED Documents

1. [INDEX.md](INDEX.md) - Added new docs to navigation
2. [documentation/](.) - Updated role-based quick starts

---

## Development Environment Setup

### Local Development

```bash
# Install dependencies
pnpm install

# Start PostgreSQL
docker-compose up postgres

# Start all services
docker-compose up -d

# Verify health
curl http://localhost:3000/health    # Gateway
curl http://localhost:4001/health    # Auth

# Run tests
pnpm test                            # Unit tests
pnpm test:integration                # Integration tests
pnpm test:e2e                        # E2E tests with curl
```

### Environment Variables

```bash
# .env
JWT_SECRET=dev-secret-change-in-prod
DB_PASSWORD=postgres-dev-password
DB_HOST=postgres
DB_PORT=5432
NODE_ENV=development
RATE_LIMIT_TIER=development
```

---

## Success Criteria

### Code Quality

✅ Each service independently testable  
✅ Unit tests verify business logic  
✅ Integration tests verify database operations  
✅ E2E tests verify full flows  
✅ 80%+ code coverage per service  

### Auditability

✅ Immutable audit logs capture all changes  
✅ User-visible scrubbed audit trail  
✅ Correlation IDs trace requests  
✅ Performance metrics recorded  
✅ Error logs with full context  

### Security

✅ Rate limiting enforced (4 dimensions)  
✅ Service-to-service authentication  
✅ Secrets in environment variables  
✅ HTTPS-only in production  
✅ CORS properly configured  

### Performance

✅ Auth operations < 100ms  
✅ Heavy operations < 500ms  
✅ OpenTelemetry tracing  
✅ Health checks on every service  
✅ No cascading failures  

### Operations

✅ Docker containers with health checks  
✅ docker-compose orchestration  
✅ Service dependencies defined  
✅ Rollback strategy  
✅ Documentation up-to-date  

---

## Next Steps

### Immediate (Next Meeting)

1. Review and approve final requirements
2. Confirm database hosting (local/cloud)
3. Clarify LLM fine-tuning approach
4. Assign roles (who owns which service)

### Week 1

1. Scaffold Auth Service (Go)
2. Create docker-compose.yml
3. Database initialization scripts
4. CI/CD pipeline setup

### Week 2+

1. Auth Service tests (unit/integration/E2E)
2. API Gateway scaffold
3. First service-to-service call
4. Frontend skeleton

---

## References & Links

- **Architecture:** [MICROSERVICES_ARCHITECTURE.md](../MICROSERVICES_ARCHITECTURE.md)
- **Database:** [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **Frontend:** [FRONTEND_UI_REQUIREMENTS.md](FRONTEND_UI_REQUIREMENTS.md)
- **Repository:** [../README.md](../README.md)
- **Tasks:** [../TODO.md](../TODO.md)
- **Git Branch:** `test/docs/pr-validation`

---

**Prepared by:** GitHub Copilot  
**Date:** February 2, 2026  
**Status:** ✅ READY FOR IMPLEMENTATION
