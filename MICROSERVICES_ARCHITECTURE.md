# PatriotChat Microservices Architecture

**Pattern:** Full Microservices with API Gateway  
**Date:** February 2, 2026

---

## 🏗️ Architecture Overview

```
                    Frontend (Angular)
                          |
                    [Port 4200]
                          |
                          v
                  API Gateway (NestJS)
                    [Port 3000]
                          |
            ________________|________________
            |       |       |       |       |
            v       v       v       v       v
         Auth   Funding  Policy  LLM   Analytics
       Service  Service Service Service Service
         :4001   :4002   :4003  :4004   :4005
         
                   Docker Containers
            (Each service independent & scalable)
```

---

## 📁 Directory Structure

```
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
- **Role:** AI/ML inference
- **Responsibilities:**
  - Model serving
  - RAG (Retrieval-Augmented Generation)
  - Query processing
  - Response generation

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
```
GET    /api/funding                 → Auth + Funding Service
GET    /api/policy/:id              → Auth + Policy Service
POST   /api/query                   → Auth + LLM Service
GET    /api/analytics/summary       → Auth + Analytics Service
```

### Gateway ↔ Microservices (HTTP/gRPC)
```
Service-to-service communication:
- HTTP for REST operations
- gRPC for high-performance operations (optional)
- Message queues for async operations (RabbitMQ/Redis)
```

### Service Data Flow
```
Frontend Request
    ↓
Gateway (validation, auth)
    ↓
Route to Service
    ↓
Service processes (may call other services)
    ↓
Response back through Gateway
    ↓
Frontend receives
```

---

## 🐳 Docker Deployment

Each service runs in its own container:

```dockerfile
# apps/services/funding/Dockerfile
FROM golang:1.21-alpine
WORKDIR /app
COPY . .
RUN go build -o funding .
EXPOSE 4002
CMD ["./funding"]
```

```yaml
# docker-compose.yml
services:
  gateway:
    build: ./apps/gateway
    ports:
      - "3000:3000"
    depends_on:
      - auth
      - funding
      - policy
  
  auth:
    build: ./apps/services/auth
    ports:
      - "4001:4001"
    environment:
      - JWT_SECRET=...
  
  funding:
    build: ./apps/services/funding
    ports:
      - "4002:4002"
  
  # ... other services
```

---

## 🛠️ Development Workflow

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start All Services
```bash
# Terminal 1: Start Docker dependencies (if using external deps)
pnpm run start:deps

# Terminal 2: Start services
pnpm start          # Starts all services

# Or individually:
pnpm start:frontend
pnpm start:api     # Gateway
pnpm nx serve auth  # Individual service
```

### 3. Build
```bash
pnpm build          # Build all apps & services
pnpm build frontend # Build specific app
```

### 4. Test
```bash
pnpm test           # Run all tests
pnpm nx test gateway
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
