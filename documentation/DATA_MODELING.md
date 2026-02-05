# Data Modeling: Mongoose + Strong Typing Patterns

**Purpose:** Best practices for combining Mongoose with TypeScript DTOs for maximum type safety

**Created:** 2026-02-02  
**Status:** Research & Strategy Phase

---

## 🎯 Problem Statement

### The Type Safety Gap

When using Mongoose with TypeScript, there's a gap between:

- **Database Layer:** Mongoose schemas (runtime validation)
- **API Layer:** DTOs (data transfer objects)
- **Application Layer:** TypeScript interfaces

This creates multiple problems:

1. Type mismatches between layers
2. Duplicate type definitions (error-prone)
3. Validation logic scattered across layers
4. Runtime data doesn't match TypeScript types

### Solution: Hybrid Pattern

Combine Mongoose schemas with TypeScript interfaces + DTOs for a single source of truth.

---

## 📐 Architecture: The Type Stack

```text
┌─────────────────────────────────────────┐
│  API Layer (HTTP)                      │
│  DTO = Data Transfer Object            │
│  (Input validation, serialization)      │
└────────────────────┬────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│  Service Layer (Business Logic)        │
│  Uses TypeScript interfaces             │
│  (Type safety, IDE support)             │
└────────────────────┬────────────────────┘
                     ↓
┌─────────────────────────────────────────┐
│  Persistence Layer (Database)           │
│  Mongoose Models + Schemas              │
│  (Runtime validation, DB structure)     │
└─────────────────────────────────────────┘

Direction: Request → DTO → Domain → Model → Document
         : Response ← Model → Domain → DTO ← API
```

---

## 🔧 Implementation Pattern: Mongoose + TypeScript

### Step 1: Define Mongoose Schema (Source of Truth)

```typescript
// src/models/schemas/log.schema.ts
import { Schema, Document } from 'mongoose';

// Define interface for Mongoose Document
export interface ILog extends Document {
  serviceId: string;
  severity: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'METRIC';
  message: string;
  traceId: string;
  context: Record<string, any>;
  timestamp: Date;
  latencyMs?: number;
}

// Create Mongoose Schema
export const LogSchema = new Schema<ILog>(
  {
    serviceId: {
      type: String,
      required: true,
      index: true,
      enum: ['frontend-interceptor', 'api-controller', 'go-query-handler', 'ollama-inference'],
    },
    severity: {
      type: String,
      required: true,
      enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'METRIC'],
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    traceId: {
      type: String,
      required: true,
      index: true,
      match: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    },
    context: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      required: true,
      default: () => new Date(),
      index: true,
    },
    latencyMs: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt
    collection: 'logs',
  },
);

// Add compound indexes for common queries
LogSchema.index({ traceId: 1, timestamp: -1 });
LogSchema.index({ serviceId: 1, severity: 1, timestamp: -1 });
LogSchema.index({ timestamp: -1 }); // For TTL policies (future)
```

### Step 2: Create Domain Interface (Business Logic Type)

```typescript
// src/domain/types/log.ts
export interface LogEntry {
  serviceId: string;
  severity: LogSeverity;
  message: string;
  traceId: string;
  context: Record<string, unknown>;
  timestamp: Date;
  latencyMs?: number;
}

export type LogSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'METRIC';

// Type guards
export function isValidSeverity(value: unknown): value is LogSeverity {
  return ['DEBUG', 'INFO', 'WARN', 'ERROR', 'METRIC'].includes(value as string);
}

export function isValidServiceId(value: unknown): value is string {
  return ['frontend-interceptor', 'api-controller', 'go-query-handler', 'ollama-inference'].includes(value as string);
}
```

### Step 3: Create DTOs (API Layer)

```typescript
// src/dtos/log.dto.ts
import { IsString, IsEnum, IsObject, IsOptional, IsNumber, IsISO8601 } from 'class-validator';

// Input DTO: Validate incoming data
export class CreateLogDTO {
  @IsString()
  serviceId: string;

  @IsEnum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'METRIC'])
  severity: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  traceId?: string;

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;

  @IsNumber()
  @IsOptional()
  latencyMs?: number;
}

// Output DTO: Shape response data
export class LogResponseDTO {
  id: string;
  serviceId: string;
  severity: string;
  message: string;
  traceId: string;
  context: Record<string, any>;
  timestamp: string; // ISO 8601
  latencyMs?: number;

  constructor(doc: any) {
    this.id = doc._id.toString();
    this.serviceId = doc.serviceId;
    this.severity = doc.severity;
    this.message = doc.message;
    this.traceId = doc.traceId;
    this.context = doc.context;
    this.timestamp = doc.timestamp.toISOString();
    this.latencyMs = doc.latencyMs;
  }
}

// Batch query DTO
export class QueryLogsDTO {
  @IsString()
  @IsOptional()
  traceId?: string;

  @IsString()
  @IsOptional()
  serviceId?: string;

  @IsEnum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'METRIC'])
  @IsOptional()
  severity?: string;

  @IsISO8601()
  @IsOptional()
  startTime?: string;

  @IsISO8601()
  @IsOptional()
  endTime?: string;

  @IsNumber()
  @IsOptional()
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  limit?: number = 50;
}
```

### Step 4: Create Service (Business Logic)

```typescript
// src/services/log.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ILog } from '../models/schemas/log.schema';
import { LogEntry, isValidSeverity, isValidServiceId } from '../domain/types/log';
import { CreateLogDTO, QueryLogsDTO, LogResponseDTO } from '../dtos/log.dto';

@Injectable()
export class LogService {
  constructor(@InjectModel('Log') private logModel: Model<ILog>) {}

  /**
   * Create log entry with type safety
   * Input: DTO (validated at controller)
   * Output: Domain type (LogEntry)
   * Persistence: Mongoose document (ILog)
   */
  async createLog(createLogDTO: CreateLogDTO): Promise<LogEntry> {
    // Convert DTO to domain type
    const logEntry: LogEntry = {
      serviceId: createLogDTO.serviceId,
      severity: createLogDTO.severity as any,
      message: createLogDTO.message,
      traceId: createLogDTO.traceId || this.generateTraceId(),
      context: createLogDTO.context || {},
      timestamp: new Date(),
      latencyMs: createLogDTO.latencyMs,
    };

    // Validate against domain rules
    if (!isValidServiceId(logEntry.serviceId)) {
      throw new Error(`Invalid serviceId: ${logEntry.serviceId}`);
    }
    if (!isValidSeverity(logEntry.severity)) {
      throw new Error(`Invalid severity: ${logEntry.severity}`);
    }

    // Persist to database
    const document = new this.logModel(logEntry);
    const saved = await document.save();

    // Return as domain type
    return this.mongooseToDomain(saved);
  }

  /**
   * Query logs with pagination
   * Input: QueryLogsDTO
   * Output: Paginated LogResponseDTO[]
   */
  async queryLogs(query: QueryLogsDTO): Promise<{
    data: LogResponseDTO[];
    total: number;
    page: number;
    limit: number;
  }> {
    const filter: Record<string, any> = {};

    if (query.traceId) filter.traceId = query.traceId;
    if (query.serviceId) filter.serviceId = query.serviceId;
    if (query.severity) filter.severity = query.severity;

    // Date range filtering
    if (query.startTime || query.endTime) {
      filter.timestamp = {};
      if (query.startTime) filter.timestamp.$gte = new Date(query.startTime);
      if (query.endTime) filter.timestamp.$lte = new Date(query.endTime);
    }

    const page = query.page || 1;
    const limit = Math.min(query.limit || 50, 500); // Cap at 500
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([this.logModel.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean().exec(), this.logModel.countDocuments(filter)]);

    return {
      data: data.map((doc) => new LogResponseDTO(doc)),
      total,
      page,
      limit,
    };
  }

  /**
   * Helper: Convert Mongoose document to domain type
   */
  private mongooseToDomain(doc: ILog): LogEntry {
    return {
      serviceId: doc.serviceId,
      severity: doc.severity,
      message: doc.message,
      traceId: doc.traceId,
      context: doc.context,
      timestamp: doc.timestamp,
      latencyMs: doc.latencyMs,
    };
  }

  private generateTraceId(): string {
    // Generate UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
```

### Step 5: Create Controller (API Endpoint)

```typescript
// src/controllers/log.controller.ts
import { Controller, Post, Get, Body, Query, UseFilters, Pipe } from '@nestjs/common';
import { LogService } from '../services/log.service';
import { CreateLogDTO, QueryLogsDTO, LogResponseDTO } from '../dtos/log.dto';

@Controller('api/logs')
export class LogController {
  constructor(private readonly logService: LogService) {}

  /**
   * POST /api/logs
   * Input validation happens via DTO + decorators
   */
  @Post()
  async createLog(@Body() createLogDTO: CreateLogDTO): Promise<LogResponseDTO> {
    // DTO is validated by NestJS class-validator
    // Type is checked at compile time
    const logEntry = await this.logService.createLog(createLogDTO);

    // Convert domain to response DTO
    return new LogResponseDTO({
      _id: new (require('mongodb').ObjectId)(),
      ...logEntry,
      timestamp: logEntry.timestamp,
    });
  }

  /**
   * GET /api/logs?traceId=...&severity=...
   * Query validation via DTO
   */
  @Get()
  async getLogs(@Query() queryDTO: QueryLogsDTO): Promise<{
    data: LogResponseDTO[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.logService.queryLogs(queryDTO);
  }
}
```

---

## 🔄 Type Flow: Complete Example

```typescript
// INCOMING REQUEST (HTTP POST)
{
  "serviceId": "api-controller",
  "severity": "ERROR",
  "message": "Query failed",
  "context": { "errorCode": 500 },
  "latencyMs": 245
}

// ↓ NestJS Validation Pipe
// Validates against CreateLogDTO
// ✓ All fields present and correct types
// ✓ Severity is in enum
// ✓ Message is string

// ↓ Controller Handler
// Type: CreateLogDTO (known good)

// ↓ Service.createLog()
// Converts to LogEntry (domain type)
// Validates business rules
// ✓ serviceId in allowed list
// ✓ severity in allowed list

// ↓ Mongoose save()
// Validates against ILog schema
// ✓ All required fields present
// ✓ Types match schema
// Persistence layer handles serialization

// ↓ Response conversion
// Converts ILog to LogResponseDTO
// Serializes dates to ISO 8601
// Strips internal fields

// ↑ HTTP RESPONSE
{
  "id": "507f1f77bcf86cd799439011",
  "serviceId": "api-controller",
  "severity": "ERROR",
  "message": "Query failed",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "context": { "errorCode": 500 },
  "timestamp": "2025-02-02T14:32:15.123Z",
  "latencyMs": 245
}
```

---

## 🛡️ Type Safety Guarantees

### Compile-Time Checks

```typescript
// ✅ Type-safe - compiler catches errors
const log: LogEntry = {
  serviceId: 'api-controller',
  severity: 'INFO',
  message: 'Request processed',
  traceId: 'uuid',
  context: {},
  timestamp: new Date(),
};

// ❌ Compiler error - invalid severity
const badLog: LogEntry = {
  severity: 'INVALID', // Error!
};

// ❌ Compiler error - missing field
const incompleteLog: LogEntry = {
  serviceId: 'api-controller',
  // Error! Missing required fields
};
```

### Runtime Checks

```typescript
// ✅ DTO validation happens automatically via decorators
const createLogDTO = plainToInstance(CreateLogDTO, incomingData);
await validate(createLogDTO); // Throws ValidationError if invalid

// ✅ Mongoose schema validation
const document = new LogModel(data);
await document.validate(); // Throws ValidationError if schema violated

// ✅ Domain validation in service
if (!isValidServiceId(logEntry.serviceId)) {
  throw new Error('Invalid serviceId');
}
```

---

## 📦 File Structure Best Practice

```text
src/
├── domain/
│   └── types/
│       ├── log.ts           # Domain interfaces + type guards
│       ├── metric.ts
│       └── trace.ts
├── models/
│   └── schemas/
│       ├── log.schema.ts    # Mongoose ILog + LogSchema
│       ├── metric.schema.ts
│       └── trace.schema.ts
├── dtos/
│   ├── log.dto.ts           # CreateLogDTO, QueryLogsDTO, LogResponseDTO
│   ├── metric.dto.ts
│   └── trace.dto.ts
├── services/
│   ├── log.service.ts       # Business logic (LogEntry type)
│   ├── metric.service.ts
│   └── trace.service.ts
└── controllers/
    ├── log.controller.ts    # API endpoints (DTO in, DTO out)
    ├── metric.controller.ts
    └── trace.controller.ts
```

**Type Safety at Each Layer:**

- ✅ Domain layer: Interfaces + type guards (business rules)
- ✅ Service layer: Converts between Mongoose documents and domain types
- ✅ Controller layer: Validates DTOs, returns DTOs
- ✅ Database layer: Mongoose schema enforces structure

---

## 🔐 Advanced: Nested Types

### Scenario: Log Context with Type Safety

```typescript
// Define nested context types
export interface RequestContext {
  userId: string;
  userAgent: string;
  ipAddress: string;
  requestId: string;
}

export interface ErrorContext extends RequestContext {
  errorCode: number;
  errorMessage: string;
  stackTrace?: string;
}

// DTO with nested validation
export class CreateErrorLogDTO extends CreateLogDTO {
  @Type(() => ErrorContext)
  @ValidateNested()
  context: ErrorContext;
}

// Mongoose schema with nested object
export const LogSchema = new Schema<ILog>({
  // ... other fields
  context: new Schema(
    {
      userId: String,
      userAgent: String,
      ipAddress: String,
      requestId: String,
      errorCode: Number,
      errorMessage: String,
      stackTrace: String,
    },
    { _id: false },
  ),
});
```

---

## 📊 Comparison: Different Patterns

| Aspect                  | Mongoose Only | DTO Only     | Hybrid (Recommended) |
| ----------------------- | ------------- | ------------ | -------------------- |
| **Compile-time safety** | ❌ None       | ✅ Full      | ✅ Full              |
| **Runtime validation**  | ✅ Schema     | ❌ None      | ✅ Both layers       |
| **Type duplication**    | N/A           | ❌ Yes       | ✅ DRY               |
| **API mismatch**        | Possible      | Possible     | Prevented            |
| **IDE support**         | Limited       | ✅ Excellent | ✅ Excellent         |
| **Error messages**      | Generic       | Custom       | Both                 |
| **Refactoring safety**  | Poor          | Good         | ✅ Excellent         |
| **Testing**             | Difficult     | ✅ Easy      | ✅ Easy              |

---

## ⚡ Performance Considerations

### 1. Lean Queries for Read Operations

```typescript
// ✅ Fast: Returns plain JavaScript objects (no Mongoose overhead)
const logs = await this.logModel.find(filter).lean().exec();

// ❌ Slow: Returns Mongoose documents with overhead
const logs = await this.logModel.find(filter).exec();
```

### 2. Select Only Needed Fields

```typescript
// ✅ Optimized: Only fetch required fields
const logs = await this.logModel.find(filter).select('serviceId severity message timestamp').lean().exec();
```

### 3. Index Strategy

```typescript
// Schema indexes
LogSchema.index({ traceId: 1, timestamp: -1 }); // For trace queries
LogSchema.index({ serviceId: 1, severity: 1 }); // For filtering
LogSchema.index({ timestamp: -1 }); // For time-based queries
```

---

## 🧪 Testing with Strong Types

```typescript
// Mock typed data for tests
const mockLog: LogEntry = {
  serviceId: 'frontend-interceptor',
  severity: 'INFO',
  message: 'Request sent',
  traceId: 'test-uuid',
  context: {},
  timestamp: new Date()
};

// Type-safe assertions
describe('LogService', () => {
  it('should create log with correct type', async () => {
    const dto: CreateLogDTO = {
      serviceId: 'api-controller',
      severity: 'ERROR',
      message: 'Test error'
    };

    const result = await logService.createLog(dto);

    // TypeScript enforces correct fields
    expect(result.serviceId).toBe('api-controller');
    expect(result.severity).toBe('ERROR');
    // ✅ Compiler error if accessing non-existent field
    expect(result.nonExistent).toBe(...); // ❌ Error!
  });
});
```

---

## ✅ Implementation Checklist

- [ ] Define Mongoose schemas with IDocument interfaces
- [ ] Create domain types with type guards
- [ ] Create DTOs with class-validator decorators
- [ ] Implement services converting between layers
- [ ] Set up controllers with DTO validation
- [ ] Add comprehensive indexes to schemas
- [ ] Write tests with typed mocks
- [ ] Document type flow diagrams
- [ ] Set up ESLint strict typing rules
- [ ] Add TypeScript strict mode to tsconfig

---

## 🚀 Best Practices Summary

1. **Single Source of Truth:** Mongoose schema is the source; derive types from it
2. **Layer Separation:** Clear types at each layer (Domain, DTO, Mongoose)
3. **Validation at Boundaries:** Validate DTOs at controller, validate at service
4. **Type Guards:** Use functions like `isValidServiceId()` for runtime safety
5. **Lean Queries:** Use `.lean()` for read operations when not modifying
6. **Proper Indexing:** Index fields used in queries for performance
7. **Nested Type Safety:** Use `@Type()` and `@ValidateNested()` for nested objects
8. **Documentation:** Document type flow and relationships
9. **Testing:** Use typed mocks, test type safety
10. **Strict Mode:** Enable TypeScript strict mode for maximum safety

---

**References:**

- Mongoose TypeScript Guide: <https://mongoosejs.com/docs/typescript.html>
- NestJS Validation: <https://docs.nestjs.com/techniques/validation>
- TypeScript Strict Mode: <https://www.typescriptlang.org/tsconfig#strict>
