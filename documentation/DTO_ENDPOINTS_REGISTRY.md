# API Endpoints Summary - DTO Mapping

## Overview

This document maps every API endpoint to its corresponding DTOs, frontend service methods, and backend controllers. Use this as a reference when adding new endpoints or modifying existing ones.

## Endpoint Registry

### Authentication Service

#### 1. POST `/auth/register`

| Component              | Location                                                | Details                                                                                      |
| ---------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Request DTO**        | `libs/shared/src/lib/api/auth.dto.ts`                   | `AuthRegisterRequest`                                                                        |
| **Response DTO**       | `libs/shared/src/lib/api/auth.dto.ts`                   | `AuthResponse`                                                                               |
| **Frontend Service**   | `apps/frontend/src/app/services/auth.service.ts`        | `register(req: AuthRegisterRequest): Observable<AuthResponse>`                               |
| **Backend Controller** | `apps/services/api-gateway/src/auth/auth.controller.ts` | `@Post('register') async register(@Body() body: AuthRegisterRequest): Promise<AuthResponse>` |
| **Description**        | User registration with email/password                   |

**Request Example:**

```typescript
{
  email: "user@example.com",
  password: "securepassword",
  name?: "John Doe"
}
```

**Response Example:**

```typescript
{
  token: "eyJhbGc...",
  userId: "user-123",
  email: "user@example.com",
  name: "John Doe",
  expiresIn: 3600
}
```

---

#### 2. POST `/auth/login`

| Component              | Location                                                | Details                                                                             |
| ---------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Request DTO**        | `libs/shared/src/lib/api/auth.dto.ts`                   | `AuthLoginRequest`                                                                  |
| **Response DTO**       | `libs/shared/src/lib/api/auth.dto.ts`                   | `AuthResponse`                                                                      |
| **Frontend Service**   | `apps/frontend/src/app/services/auth.service.ts`        | `login(req: AuthLoginRequest): Observable<AuthResponse>`                            |
| **Backend Controller** | `apps/services/api-gateway/src/auth/auth.controller.ts` | `@Post('login') async login(@Body() body: AuthLoginRequest): Promise<AuthResponse>` |
| **Description**        | User login with email/password                          |

---

#### 3. POST `/auth/validate`

| Component              | Location                                                | Details                                                             |
| ---------------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| **Request Auth**       | (Token in Authorization header)                         | JWT token                                                           |
| **Response DTO**       | `libs/shared/src/lib/api/auth.dto.ts`                   | `AuthValidateResponse`                                              |
| **Frontend Service**   | `apps/frontend/src/app/services/auth.service.ts`        | `validate(): Observable<AuthValidateResponse>`                      |
| **Backend Controller** | `apps/services/api-gateway/src/auth/auth.controller.ts` | `@Post('validate') async validate(): Promise<AuthValidateResponse>` |
| **Description**        | Validate JWT token and get user info                    |

**Response Example:**

```typescript
{
  userId: "user-123",
  email: "user@example.com",
  name: "John Doe",
  tier: "premium",
  iat: 1645678900,
  exp: 1645682500
}
```

---

### Inference Service

#### 4. GET `/inference/models`

| Component              | Location                                                          | Details                                                              |
| ---------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Request**            | (No body)                                                         | GET request                                                          |
| **Response DTO**       | `libs/shared/src/lib/api/inference.dto.ts`                        | `InferenceModelsResponse`                                            |
| **Frontend Service**   | `apps/frontend/src/app/services/inference.service.ts`             | `getModels(): Observable<InferenceModelsResponse>`                   |
| **Backend Controller** | `apps/services/api-gateway/src/inference/inference.controller.ts` | `@Get('models') async getModels(): Promise<InferenceModelsResponse>` |
| **Description**        | Get list of available LLM models                                  |

**Response Example:**

```typescript
{
  models: [
    {
      id: 'llama2',
      name: 'Llama 2',
      description: "Meta's Llama 2 model",
      provider: 'LLM Service',
      contextWindow: 4096,
    },
    {
      id: 'mistral',
      name: 'Mistral',
      description: 'Mistral 7B model',
      provider: 'LLM Service',
      contextWindow: 8000,
    },
  ];
}
```

---

#### 5. POST `/inference/generate`

| Component              | Location                                                          | Details                                                                                                                 |
| ---------------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Request DTO**        | `libs/shared/src/lib/api/inference.dto.ts`                        | `InferenceGenerateRequest`                                                                                              |
| **Response DTO**       | `libs/shared/src/lib/api/inference.dto.ts`                        | `InferenceGenerateResponse`                                                                                             |
| **Frontend Service**   | `apps/frontend/src/app/services/inference.service.ts`             | `generateInference(req: InferenceGenerateRequest): Observable<InferenceGenerateResponse>`                               |
| **Backend Controller** | `apps/services/api-gateway/src/inference/inference.controller.ts` | `@Post('generate') async generateInference(@Body() body: InferenceGenerateRequest): Promise<InferenceGenerateResponse>` |
| **Authentication**     | Required (JwtAuthGuard)                                           | JWT token required                                                                                                      |
| **Description**        | Generate text using specified LLM model                           |

**Request Example:**

```typescript
{
  modelId: "llama2",
  prompt: "What is the meaning of life?",
  maxTokens: 500,
  temperature: 0.7
}
```

**Response Example:**

```typescript
{
  modelId: "llama2",
  prompt: "What is the meaning of life?",
  text: "The meaning of life is a profound question...",
  tokensUsed: 145,
  finishReason: "length"
}
```

---

## Type Safety Flow

### Frontend Call Flow

```
Component
  ↓
inferenceService.generateInference(req: InferenceGenerateRequest)
  ↓
http.post<InferenceGenerateResponse>(url, req)
  ↓
ApiInterceptor validates response matches shape
  ↓
Observable<InferenceGenerateResponse> returned to component
  ↓
Component subscribes with typed response
```

### Backend Call Flow

```
HttpRequest with InferenceGenerateRequest body
  ↓
NestJS validates body against InferenceGenerateRequest DTO
  ↓
InferenceController.generateInference(body: InferenceGenerateRequest)
  ↓
InferenceService processes request
  ↓
Returns InferenceGenerateResponse typed response
  ↓
ResponseInterceptor wraps in ApiResponse structure
  ↓
HttpResponse sent to frontend
```

## DTO Import Locations

### Frontend (uses local copy due to module resolution)

```typescript
import { InferenceGenerateRequest, InferenceGenerateResponse, AuthResponse, AuthError } from '../types/api.dto';
```

**Location**: `apps/frontend/src/app/types/api.dto.ts`

### Backend (uses shared library)

```typescript
import { InferenceGenerateRequest, InferenceGenerateResponse, AuthResponse, ApiError } from '@patriotchat/shared';
```

**Location**: `libs/shared/src/index.ts`

## Error Response Structure

All endpoints return errors in this format via `ApiError`:

```typescript
{
  status: number;
  message: string;
  code: string;  // Error code like "LLM_SERVICE_ERROR"
  details: Record<string, unknown>;  // Additional error context
  expectedType?: string;  // For validation errors
  receivedType?: string;  // For validation errors
  timestamp: number;
}
```

**HTTP Status Codes**:

- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `422`: Unprocessable Entity (DTO validation failed)
- `500`: Internal Server Error
- `502`: Bad Gateway (LLM service unavailable)

---

## Adding New Endpoints Checklist

When adding a new endpoint, follow this exact sequence:

### Step 1: Define DTOs

- [ ] Create `libs/shared/src/lib/api/my-feature.dto.ts`
- [ ] Define `MyFeatureRequest` interface
- [ ] Define `MyFeatureResponse` interface
- [ ] Export from `libs/shared/src/index.ts`

### Step 2: Implement Backend

- [ ] Create `apps/services/api-gateway/src/my-feature/`
- [ ] Create controller with typed methods
- [ ] Create service with business logic
- [ ] Register in app module
- [ ] Test endpoint with `curl` or Postman

### Step 3: Implement Frontend

- [ ] Copy DTOs to `apps/frontend/src/app/types/api.dto.ts`
- [ ] Create `apps/frontend/src/app/services/my-feature.service.ts`
- [ ] Service methods must return `Observable<DTO>`
- [ ] Update `app.module.ts` providers

### Step 4: Validation

- [ ] Add entry to this document
- [ ] Run `pnpm nx run api-gateway:build` ✅
- [ ] Run `pnpm nx run frontend:build` ✅
- [ ] Run `pnpm nx run frontend:lint` (0 errors) ✅
- [ ] Create component/integration test

### Step 5: Documentation

- [ ] Add endpoint description
- [ ] Add request/response examples
- [ ] Add to this registry

---

## Common Implementation Patterns

### Pattern: Secure Endpoint (with JWT)

```typescript
// Backend
@Post('secure-action')
@UseGuards(JwtAuthGuard)
async secureAction(@Body() body: SecureRequest): Promise<SecureResponse> {
  // User is authenticated
  return { ... };
}

// Frontend
secureAction(req: SecureRequest): Observable<SecureResponse> {
  return this.http.post<SecureResponse>(`${this.apiUrl}/secure-action`, req);
}
// ApiInterceptor automatically adds Authorization header from localStorage
```

### Pattern: Paginated List

```typescript
// DTO
export interface ListItem { id: string; name: string; }
export interface ListRequest { page: number; pageSize: number; }
export interface ListResponse { items: ListItem[]; total: number; page: number; }

// Backend
@Get('list')
async list(@Query() query: ListRequest): Promise<ListResponse> {
  const skip = query.page * query.pageSize;
  const items = await this.repo.find({ skip, take: query.pageSize });
  const total = await this.repo.count();
  return { items, total, page: query.page };
}

// Frontend
list(page: number = 0, pageSize: number = 20): Observable<ListResponse> {
  return this.http.get<ListResponse>(`${this.apiUrl}/list`, {
    params: { page, pageSize }
  });
}
```

---

## See Also

- [Shared DTO Pattern Documentation](./SHARED_DTO_PATTERN.md)
- [Implementation Checklist](./SHARED_DTO_PATTERN.md#implementation-checklist)
- [Troubleshooting Guide](./SHARED_DTO_PATTERN.md#troubleshooting)
