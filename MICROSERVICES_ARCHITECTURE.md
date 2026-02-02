# PatriotChat Microservices Architecture

**Pattern:** Full Microservices with API Gateway  
**Date:** February 2, 2026

---

## 🏗️ Architecture Overview

```text
                    Frontend (Angular)
                          |
                    [Port 4200]
                          |
                          v
                  API Gateway (NestJS)
                    [Port 3000]
       [Rate Limiting: IP + User/API-Key + Endpoint + Tier-Based]
                          |
            ________________|________________
            |       |       |       |       |
            v       v       v       v       v
         Auth   Funding  Policy  LLM   Analytics
       Service  Service Service Service Service
         :4001   :4002   :4003  :4004   :4005
         
                   Docker Containers
            (Each service independent & scalable)
            
                      PostgreSQL
            (ACID, audit trails, JSONB support)
```

---

## ✅ Final Requirements (Approved)

### Performance Target

- MVP: < 100ms for Auth operations, < 500ms for heavy operations
- Monitored via OpenTelemetry distributed tracing

### Audit Trail Visibility

- **Internal:** Full audit logs (system operations, all changes)
- **User-Visible:** Scrubbed anonymous data about their account activity
- **API Response:** Include audit metadata (user who made change, timestamp, what changed)
- **Privacy:** Personally identifiable information scrubbed before user visibility

### Database Strategy

- **Primary:** PostgreSQL (all services)
- **Rationale:** ACID guarantees, temporal tables, JSONB support, excellent audit trail capabilities
- **Audit Tables:** Append-only, immutable, with soft deletes + hard delete records

### LLM Model

- **Selection:** Mistral (primary choice)
- **Fine-tuning:** Local fine-tuned models (no OpenAI/Grok API calls)
- **Multi-Model Support:** Optional toggle between 3 fine-tuned LLM variants
  - If common patterns exist → Include 3-model dropdown in frontend
  - If heavy lift → Start with single Mistral, plan for future multi-model

### Rate Limiting Strategy

- **Tier-Based Limits:**
  - Free tier
  - Power tier
  - Premium tier
- **Multi-Dimensional:**
  - Per IP address (prevent abuse)
  - Per user/API key (account-level limits)
  - Per endpoint (sensitive endpoints stricter)
  - Per tier (free < power < premium)
- **Example Limits:**
  - Free: 100 req/hour, 10 req/min on LLM
  - Power: 10,000 req/hour, 100 req/min on LLM
  - Premium: 100,000 req/hour, 1,000 req/min on LLM

---

## 📁 Directory Structure

```text
patriotchat/
├── apps/
│   ├── frontend/                    ← Angular SPA (Port 4200)
│   │   ├── src/app/
│   │   ├── src/assets/
│   │   └── project.json
│   │
│   ├── gateway/                     ← NestJS API Gateway (Port 3000)
│   │   ├── src/
│   │   │   ├── auth/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   ├── proxies/            ← Route to microservices
│   │   │   └── main.ts
│   │   └── project.json
│   │
│   ├── services/
│   │   ├── auth/                    ← Auth Microservice (Port 4001)
│   │   │   ├── src/ (Go)
│   │   │   ├── go.mod
│   │   │   ├── main.go
│   │   │   ├── Dockerfile
│   │   │   └── project.json
│   │   │
│   │   ├── funding/                 ← Funding Data Service (Port 4002)
│   │   │   ├── src/ (Go)
│   │   │   ├── fetchers/
│   │   │   ├── Dockerfile
│   │   │   └── project.json
│   │   │
│   │   ├── policy/                  ← Policy Service (Port 4003)
│   │   │   ├── src/ (Go)
│   │   │   ├── Dockerfile
│   │   │   └── project.json
│   │   │
│   │   ├── llm/                     ← LLM Service (Port 4004)
│   │   │   ├── src/ (Go)
│   │   │   ├── models/
│   │   │   ├── Dockerfile
│   │   │   └── project.json
│   │   │
│   │   └── analytics/               ← Analytics Service (Port 4005)
│   │       ├── src/ (Go)
│   │       ├── Dockerfile
│   │       └── project.json
│   │
│   └── api-e2e/                     ← E2E tests for gateway
│       ├── src/
│       └── project.json
│
├── libs/
│   ├── shared/                      ← Shared TypeScript types
│   │   ├── src/
│   │   │   ├── models/              (DTOs, entities)
│   │   │   ├── utils/               (validators, helpers)
│   │   │   ├── types/               (interfaces)
│   │   │   └── index.ts
│   │   └── project.json
│   │
│   ├── domain/                      ← Domain logic (shared)
│   │   ├── src/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── services/
│   │   │   └── index.ts
│   │   └── project.json
│   │
│   └── ui/                          ← Angular components library
│       ├── src/
│       │   ├── components/
│       │   ├── directives/
│       │   ├── pipes/
│       │   ├── styles/
│       │   └── index.ts
│       └── project.json
│
├── dist/                            ← Centralized builds
│   ├── apps/
│   ├── libs/
│   └── services/
│
├── docker-compose.yml               ← All services orchestration
├── nx.json                          ← NX configuration
├── tsconfig.base.json               ← Path aliases
└── package.json                     ← Dependencies
```

---

## 🚀 Services Overview

### 1. **API Gateway** (NestJS)

- **Port:** 3000
- **Role:** Entry point for frontend, routes to microservices
- **Responsibilities:**
  - Authentication & authorization
  - Rate limiting
  - Request/response transformation
  - Service discovery & routing
  - Error handling & logging
  - CORS & security headers

### 2. **Auth Service** (Go)

- **Port:** 4001
- **Role:** User authentication & tokens
- **Responsibilities:**
  - JWT generation/validation
  - OAuth integrations (if needed)
  - Session management
  - Permission checks

### 3. **Funding Service** (Go)

- **Port:** 4002
- **Role:** Financial data aggregation
- **Responsibilities:**
  - Fetch from FEC, ProPublica, etc.
  - Data parsing & normalization
  - Caching strategy
  - Search & filtering

### 4. **Policy Service** (Go)

- **Port:** 4003
- **Role:** Policy data management
- **Responsibilities:**
  - Policy records
  - Auditing & compliance
  - Version control
  - Enforcement rules

### 5. **LLM Service** (Go)

- **Port:** 4004
- **Role:** AI/ML inference with fine-tuned local models
- **Model:** Mistral (fine-tuned, no external APIs)
- **Multi-Model Support:** Optional toggle between 3 fine-tuned variants (if feasible with common patterns)
- **Responsibilities:**
  - Model serving (local inference)
  - RAG (Retrieval-Augmented Generation)
  - Query processing & validation
  - Response generation & caching
  - Performance monitoring per model

### 6. **Analytics Service** (Go)

- **Port:** 4005
- **Role:** Metrics & insights
- **Responsibilities:**
  - Data aggregation
  - Report generation
  - Trend analysis
  - Performance monitoring

---

## 🔄 Communication Patterns

### Frontend → Gateway (HTTP/REST)

```text
GET    /api/funding                 → Auth + Funding Service
GET    /api/policy/:id              → Auth + Policy Service
POST   /api/query                   → Auth + LLM Service (model selector optional)
GET    /api/audit/my-activity       → Auth + Audit Service (scrubbed user data)
GET    /api/analytics/summary       → Auth + Analytics Service
```

### Gateway ↔ Microservices (HTTP/gRPC)

```text
Service-to-service communication:
- HTTP for REST operations
- gRPC for high-performance operations (optional)
- Message queues for async operations (RabbitMQ/Redis)

All requests include:
- Correlation ID (distributed tracing)
- Service authentication (internal JWT)
- Audit context (user ID, operation, timestamp)
```

### Service Data Flow

```text
Frontend Request
    ↓
Gateway [Rate Limit Check: IP + User + Endpoint + Tier]
    ↓
Auth Guard [Validate JWT]
    ↓
Route to Service [Include audit context]
    ↓
Service processes [Log all changes to audit table]
    ↓
Response with Audit Metadata [Timestamp, user, change type]
    ↓
Gateway [Transform response, scrub sensitive data if user-visible audit]
    ↓
Frontend receives [With audit trail context]
```

---

## 🐳 Docker Deployment

Each service runs in its own container with PostgreSQL for persistent storage:

```dockerfile
# apps/services/auth/Dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go build -o auth .
EXPOSE 4001
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4001/health || exit 1
CMD ["./auth"]
```

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: patriotchat
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  gateway:
    build: ./apps/gateway
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      auth:
        condition: service_healthy
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - RATE_LIMIT_TIER=development
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3
  
  auth:
    build: ./apps/services/auth
    ports:
      - "4001:4001"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_HOST=postgres
      - JWT_SECRET=${JWT_SECRET}
      - JWT_EXPIRY=24h
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4001/health"]
      interval: 10s
      timeout: 5s
      retries: 3
  
  funding:
    build: ./apps/services/funding
    ports:
      - "4002:4002"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_HOST=postgres
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4002/health"]
      interval: 10s
      timeout: 5s
      retries: 3
  
  policy:
    build: ./apps/services/policy
    ports:
      - "4003:4003"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_HOST=postgres
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4003/health"]
      interval: 10s
      timeout: 5s
      retries: 3
  
  llm:
    build: ./apps/services/llm
    ports:
      - "4004:4004"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_HOST=postgres
      - LLM_MODEL=mistral
      - LLM_VARIANTS=3  # Optional: support 3 fine-tuned variants
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4004/health"]
      interval: 10s
      timeout: 5s
      retries: 3
  
  analytics:
    build: ./apps/services/analytics
    ports:
      - "4005:4005"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_HOST=postgres
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:4005/health"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_data:
```

---

## 🛠️ Development Workflow

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Set secrets (or use defaults for development)
JWT_SECRET=dev-secret-change-in-prod
DB_PASSWORD=postgres-dev-password
```

### 3. Start All Services

```bash
# Terminal 1: Start Docker services
docker-compose up -d

# Wait for services to become healthy
docker-compose ps  # Check STATUS column

# Terminal 2: Start frontend (if using dev server)
pnpm start frontend

# Or use Make command (if available):
make dev        # Start all services + frontend
```

### 4. Verify Services Are Running

```bash
# Check health of each service
curl http://localhost:3000/health        # Gateway
curl http://localhost:4001/health        # Auth
curl http://localhost:4002/health        # Funding
curl http://localhost:4003/health        # Policy
curl http://localhost:4004/health        # LLM
curl http://localhost:4005/health        # Analytics

# Should all return 200 OK with status: "ok"
```

### 5. Build

```bash
pnpm build                              # Build all apps & services
docker-compose build --no-cache         # Rebuild images
```

### 6. Test

```bash
pnpm test                               # Run all unit tests
pnpm test:integration                   # Run integration tests (with DB)
pnpm test:e2e                           # Run E2E tests (curl commands)
```

### 7. Cleanup

```bash
docker-compose down -v                  # Stop services & remove volumes
```

---

## �️ Database Design (PostgreSQL)

### Core Audit Pattern

```sql
-- Audit log table (append-only, immutable)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(50) NOT NULL,      -- 'user', 'policy', 'funding', etc.
    entity_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,        -- 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
    user_id UUID NOT NULL,
    changes JSONB NOT NULL,                -- What changed (old_value -> new_value)
    scrubbed_changes JSONB,                -- User-visible version (PII removed)
    created_at TIMESTAMP DEFAULT now(),
    correlation_id UUID,                   -- For tracing
    INDEX ON (entity_type, entity_id),
    INDEX ON (user_id, created_at),
    INDEX ON (created_at DESC)
);

-- User accounts with tier
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    tier VARCHAR(20) NOT NULL DEFAULT 'free',  -- 'free', 'power', 'premium'
    created_at TIMESTAMP DEFAULT now(),
    INDEX ON (tier)
);

-- Audit trail for user actions
CREATE TABLE user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100),
    resource VARCHAR(100),
    timestamp TIMESTAMP DEFAULT now(),
    ip_address INET,
    correlation_id UUID,
    INDEX ON (user_id, timestamp DESC)
);
```

### What Gets Audited

- **System-Level:** All database changes (audit_logs table)
- **User-Level:** User activity summary (user_activity table)
- **User-Visible Audit:** Scrubbed changes in API responses

### Scrubbed Data Strategy

```typescript
// Example: Remove PII from audit response
const scrubAuditForUser = (audit: AuditLog) => ({
    id: audit.id,
    entity_type: audit.entity_type,
    entity_id: audit.entity_id,
    operation: audit.operation,
    created_at: audit.created_at,
    changes: {
        // Only show non-PII fields
        status: audit.changes.status,
        category: audit.changes.category,
        // Exclude: email, phone, ssn, address, etc.
    }
});
```

---

## 🛑 Rate Limiting Strategy

### Multi-Dimensional Implementation

The gateway will enforce rate limits across 4 dimensions:

#### 1. **Per IP Address** (DDoS Protection)

```
Free: 1,000 req/min
Power: 5,000 req/min  
Premium: 10,000 req/min
```

#### 2. **Per User/API Key** (Account Limits)

```
Free tier user: 100 requests/hour
Power tier user: 10,000 requests/hour
Premium tier user: 100,000 requests/hour
```

#### 3. **Per Endpoint** (Sensitive Operations)

```
POST /api/auth/register          → 5 req/min (prevent registration spam)
POST /api/auth/login             → 10 req/min (prevent brute force)
POST /api/query (LLM)            → Varies by tier (heavy operation)
GET  /api/funding/search         → 30 req/min (external API calls)
```

#### 4. **Per Tier** (Business Model)

```
Free Tier:
  - 100 requests/hour total
  - 1 LLM query/min
  - 5 funding searches/hour
  
Power Tier:
  - 10,000 requests/hour total
  - 10 LLM queries/min
  - 100 funding searches/hour
  
Premium Tier:
  - 100,000 requests/hour total
  - 100 LLM queries/min
  - 1,000 funding searches/hour
```

### Implementation Location

- **Gateway Rate Limiter:** Enforces all rules before routing to services
- **Redis Backend:** Stores counters for distributed rate limiting
- **Headers:** Return `X-RateLimit-*` headers in responses for visibility

### Example Rate Limit Header Response

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1675000800
X-RateLimit-Tier: power
```

---

## 📊 Advantages of This Architecture

✅ **Scalability:** Each service scales independently  
✅ **Resilience:** Service failure doesn't crash entire system  
✅ **Technology Flexibility:** Mix Node.js, Go, etc.  
✅ **Team Autonomy:** Different teams own different services  
✅ **Deployment:** Deploy individual services without full rebuild  
✅ **Performance:** Go services for CPU-intensive work  
✅ **Clear Boundaries:** Each service has specific responsibility  

---

## ⚠️ Operational Considerations

### Monitoring

- Service health checks
- Distributed tracing (Jaeger/Zipkin)
- Centralized logging (ELK stack)
- Metrics collection (Prometheus)

### Deployment

- Each service has own CI/CD pipeline
- Blue-green deployments possible
- Backward compatibility for API versions
- Circuit breakers for fault tolerance

### Documentation

- OpenAPI specs per service
- Service contracts
- API versioning strategy
- Error code documentation

---

## 🔗 References

- [NX Microservices Guide](https://nx.dev/recipes/microservices)
- [Go REST API Best Practices](https://golang.org/doc/effective_go)
- [NestJS Best Practices](https://docs.nestjs.com/techniques/http-module)
- [Docker Compose for Development](https://docs.docker.com/compose/)

---

**Status:** Ready for scaffolding  
**Next:** Create gateway, then individual services
