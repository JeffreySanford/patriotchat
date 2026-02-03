# Shared DTO Pattern & Architecture

## Overview

The **Shared DTO Pattern** ensures **end-to-end type safety** from frontend to backend. All HTTP communication between frontend and backend goes through **typed DTOs** defined in `@patriotchat/shared`, preventing runtime errors and ensuring API contracts never break.

## Pattern Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                   @patriotchat/shared (libs/shared)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ├─ lib/api/inference.dto.ts                                     │
│  │  ├─ InferenceModelsResponse                                   │
│  │  ├─ InferenceGenerateRequest                                  │
│  │  └─ InferenceGenerateResponse                                 │
│  │                                                                │
│  ├─ lib/api/auth.dto.ts                                          │
│  │  ├─ AuthRegisterRequest                                       │
│  │  ├─ AuthLoginRequest                                          │
│  │  ├─ AuthResponse                                              │
│  │  └─ AuthValidateResponse                                      │
│  │                                                                │
│  └─ lib/errors/api-error.ts                                      │
│     ├─ ApiError (base class)                                     │
│     ├─ ValidationError                                           │
│     └─ ErrorDetails                                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
         ↓                                   ↓
    Imported by Backend              Imported by Frontend
    (NestJS Controllers)             (Angular Services)
         ↓                                   ↓
┌──────────────────────┐         ┌──────────────────────┐
│  API Gateway         │         │  Frontend App        │
│  (apps/services/     │◄────────►│  (apps/frontend)     │
│   api-gateway)       │  HTTP    │                      │
│                      │          │                      │
│ ├─ controllers/      │          │ ├─ services/        │
│ ├─ services/         │          │ ├─ interceptors/    │
│ └─ interceptors/     │          │ └─ types/ (copies)  │
└──────────────────────┘          └──────────────────────┘
```

## Current Endpoints

### 1. Inference API (`/inference`)

**Purpose**: LLM model inference - get available models and generate text

| Operation | Method | Endpoint | Frontend Service | Backend Controller | DTO(s) |
|-----------|--------|----------|------------------|-------------------|--------|
| Get Models | GET | `/inference/models` | `InferenceService.getModels()` | `InferenceController.getModels()` | `InferenceModelsResponse` |
| Generate | POST | `/inference/generate` | `InferenceService.generateInference()` | `InferenceController.generateInference()` | `InferenceGenerateRequest` → `InferenceGenerateResponse` |

**Frontend Implementation** (`apps/frontend/src/app/services/inference.service.ts`):

```typescript
getModels(): Observable<{ data: InferenceModelsResponse; timestamp: number; status: number }>
generateInference(req: InferenceGenerateRequest): Observable<{ data: InferenceGenerateResponse; timestamp: number; status: number }>
```

**Backend Implementation** (`apps/services/api-gateway/src/inference/`):

```typescript
@Get('models'): Promise<InferenceModelsResponse>
@Post('generate'): Promise<InferenceGenerateResponse>
```

### 2. Auth API (`/auth`)

**Purpose**: User authentication and validation

| Operation | Method | Endpoint | Frontend Service | Backend Controller | DTO(s) |
|-----------|--------|----------|------------------|-------------------|--------|
| Register | POST | `/auth/register` | `AuthService.register()` | `AuthController.register()` | `AuthRegisterRequest` → `AuthResponse` |
| Login | POST | `/auth/login` | `AuthService.login()` | `AuthController.login()` | `AuthLoginRequest` → `AuthResponse` |
| Validate | POST | `/auth/validate` | `AuthService.validate()` | `AuthController.validate()` | (token in header) → `AuthValidateResponse` |

## DTO Enforcement Rules

### Rule 1: Frontend Service Methods Must Import DTOs from Shared

```typescript
// ✅ CORRECT
import { InferenceGenerateRequest, InferenceGenerateResponse } from '@patriotchat/shared';

getModels(): Observable<InferenceModelsResponse> { ... }
generateInference(req: InferenceGenerateRequest): Observable<InferenceGenerateResponse> { ... }

// ❌ WRONG - Using `any` or loose types
getModels(): Observable<any> { ... }
generateInference(req: Record<string, any>): Observable<Record<string, any>> { ... }
```

### Rule 2: Backend Controller Methods Must Match Frontend DTOs

```typescript
// ✅ CORRECT - Controller method returns exactly what frontend expects
@Get('models')
async getModels(): Promise<InferenceModelsResponse> { ... }

// ❌ WRONG - Returning different shape
@Get('models')
async getModels(): Promise<string[]> { ... }  // Frontend expects InferenceModelsResponse
```

### Rule 3: HTTP Interceptors Must Validate Responses

```typescript
// ✅ CORRECT - Frontend interceptor validates responses
validateResponse(response: HttpResponse<unknown>): HttpResponse<unknown> {
  const { data } = response.body as Record<string, unknown>;
  // Validates shape matches DTO
  return response;
}

// Backend error interceptor converts to ApiError
catchError((error: unknown) => {
  return throwError(() => new ApiError({ ... }));
});
```

### Rule 4: Backend Must Throw ApiError on Failures

```typescript
// ✅ CORRECT - Using ApiError with proper status codes
throw new BadGatewayException(
  new ApiError({
    status: 502,
    message: 'LLM service unavailable',
    code: 'LLM_SERVICE_ERROR',
    details: { service: 'LLM', endpoint: '/models' },
  })
);

// ❌ WRONG - Generic exceptions lose type info
throw new Error('Something went wrong');
```

## Adding New Endpoints

### Step 1: Define DTOs in Shared Library

Create file: `libs/shared/src/lib/api/my-feature.dto.ts`

```typescript
export interface MyFeatureRequest {
  id: string;
  data: string;
}

export interface MyFeatureResponse {
  result: string;
  processedAt: number;
}
```

Export from `libs/shared/src/index.ts`:

```typescript
export * from './lib/api/my-feature.dto';
```

### Step 2: Implement Backend Endpoint

File: `apps/services/api-gateway/src/my-feature/my-feature.controller.ts`

```typescript
import { MyFeatureRequest, MyFeatureResponse } from '@patriotchat/shared';

@Controller('my-feature')
export class MyFeatureController {
  @Post('action')
  async doAction(@Body() body: MyFeatureRequest): Promise<MyFeatureResponse> {
    // Implementation
    return { result: '...', processedAt: Date.now() };
  }
}
```

### Step 3: Create Frontend Service

File: `apps/frontend/src/app/services/my-feature.service.ts`

```typescript
import { MyFeatureRequest, MyFeatureResponse } from '../types/api.dto';  // or shared if path resolves

@Injectable({ providedIn: 'root' })
export class MyFeatureService {
  private readonly apiUrl = '/my-feature';

  doAction(req: MyFeatureRequest): Observable<MyFeatureResponse> {
    return this.http.post<MyFeatureResponse>(`${this.apiUrl}/action`, req);
  }
}
```

### Step 4: Use in Components

```typescript
this.myFeatureService.doAction(request).subscribe({
  next: (response: MyFeatureResponse) => {
    // Fully typed! No `any` needed
    console.log(response.result);
  },
  error: (err: ApiError | HttpErrorResponse) => {
    // Error handling
  }
});
```

## Type Safety Guarantees

| Scenario | Without Pattern | With DTO Pattern |
|----------|---|---|
| Frontend calls wrong endpoint | Runtime error | TypeScript error at compile time |
| Backend changes response structure | Runtime error | Build failure |
| Backend returns wrong type | Runtime error | Build failure |
| Frontend doesn't handle error | Uncaught error | Typed error handling enforced |
| Adding new field to request | No validation | Build failure if not handled |

## Implementation Checklist

Before adding a new endpoint, verify:

- [ ] **DTO Defined**: Request/Response types defined in `libs/shared/src/lib/api/`
- [ ] **Exported**: DTOs exported from `libs/shared/src/index.ts`
- [ ] **Backend Typed**: Controller methods return DTO type exactly
- [ ] **Backend Error Handling**: All errors throw `ApiError` with proper codes
- [ ] **Frontend Service Typed**: Service methods accept/return DTO types
- [ ] **Frontend Component Typed**: Component subscribes with typed error handling
- [ ] **Builds**: Both `pnpm nx run api-gateway:build` and `pnpm nx run frontend:build` succeed
- [ ] **No Errors**: `pnpm nx run frontend:lint` has 0 errors (warnings OK)

## Common Patterns

### Pattern 1: List Endpoint

```typescript
// DTO
export interface ListItemResponse {
  id: string;
  name: string;
}

export interface ListResponse {
  items: ListItemResponse[];
  total: number;
}

// Backend
@Get('list')
async getList(): Promise<ListResponse> {
  const items = await this.service.list();
  return { items, total: items.length };
}

// Frontend
getList(): Observable<ListResponse> {
  return this.http.get<ListResponse>(`${this.apiUrl}/list`);
}
```

### Pattern 2: Create Endpoint

```typescript
// DTO
export interface CreateRequest {
  name: string;
  email: string;
}

export interface CreateResponse {
  id: string;
  ...CreateRequest;
  createdAt: number;
}

// Backend
@Post('create')
async create(@Body() body: CreateRequest): Promise<CreateResponse> {
  const created = await this.service.create(body);
  return { ...created, createdAt: Date.now() };
}

// Frontend
create(req: CreateRequest): Observable<CreateResponse> {
  return this.http.post<CreateResponse>(`${this.apiUrl}/create`, req);
}
```

## Troubleshooting

**Issue**: "Cannot find module '@patriotchat/shared'"

- **Solution**: Frontend uses local copy in `apps/frontend/src/app/types/api.dto.ts`
- Keep in sync with `libs/shared/src/lib/api/*`

**Issue**: Build succeeds but lint fails

- **Solution**: Add type annotations to variables
- Use `as const` for readonly values

**Issue**: Tests fail with type errors

- **Solution**: Import DTO types in test files
- Mock responses matching DTO shape exactly

## See Also

- [API Endpoints Summary](./api/ENDPOINTS_SUMMARY.md)
- [Backend Architecture](./MICROSERVICES_ARCHITECTURE.md)
- [Frontend Architecture](./FRONTEND_UI_REQUIREMENTS.md)
