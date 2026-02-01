# Craft Fusion Coding Standards

## Angular Guidelines

These standards apply to Angular 19 with Nx 20 workspace management and keep every component inside NgModules so shared services, material imports, and route resolvers resolve predictably.

- **NEVER use standalone components** – the enterprise-grade architecture depends on NgModule declarations, shared import graphs, and guardrail validation; allowing standalone components would fragment dependencies and make auditing harder.
- **NEVER use Angular Signals** – we require the Observable + RxJS pattern (hot, shareable observables) for transparent state flow. Signals hide subscription timing, bypass established facades, and erode the guardrail instrumentation we audit on every release.
- **NEVER use Zoneless Angular** – `Zone.js` provides async tracking, consistent change detection, and diagnosable stacks that are critical for tracing call/response flows and spotting illegal content shared by anonymous clients. Dropping Zones would break those audits.
- Always declare components inside their NgModule and keep `standalone: false`.
- Favor shared material modules over `CUSTOM_ELEMENTS_SCHEMA` so Angular can validate module imports before runtime.
- Hot observables (e.g., `shareReplay`, `BehaviorSubject`, facades) drive state; avoid Promises for recurring or multi-subscriber data.
- Prefer reactive forms for complex input and leverage resolvers for route data hydration to minimize flicker and duplication.
- Use dependency injection and `providedIn: 'root'` services so guards, interceptors, and sockets can reuse DTO-powered logic consistently.
- Prefer Angular's `inject()` helper over constructor injection when wiring services or helpers into components/services so dependencies stay explicit and easier to mock during tests.
- **Favor `inject()` everywhere**: guard against implicit constructor wiring by calling `inject()` (or helper `provideXxx()` wrappers) inside guards, interceptors, resolvers, and components so every dependency path can be overridden in tests without relying on metadata reflection.

## Enterprise Enforcement: Standalone, Signals & Promise policy

To ensure auditability, consistency, and predictable change-detection across the entire monorepo, the following rules are strictly enforced:

- **NEVER** use `standalone: true` components. All components must be declared in an `NgModule` and explicitly set `standalone: false`.
- **NEVER** import or use Angular Signals (`signal`, `computed`, `effect`, `Signal`, `WritableSignal`, `injectSignal`, etc.). Use RxJS Observables for all reactive patterns.
- **NEVER** construct `Promise` objects (e.g., `new Promise(...)`) or rely on `.then` chaining inside services or controllers. Services and controllers should return `Observable` types or use adapter patterns to convert one-off interop calls into `Observable` streams.

Rationale: These rules favor enterprise-level observability, easier automated auditing, and predictable behavior for guardrails and instrumentation. They also make code reviews deterministic and reduce accidental bypass of guardrail instrumentation.

Exceptions: Exceptions are allowed only via a documented approval process. Any PR that requires an exception must include a short justification in its description and be explicitly approved by an owner listed in `CODEOWNERS` (add reviewer name and date in the PR body). Exceptions are recorded in the governance log with rationale and duration.

## Typing & Shared DTO policy

Strong typing is mandatory across the workspace to prevent `any`/`unknown` creeping into services, controllers, or shared logic. Follow these rules:

- **NO `any` or `unknown`**: Avoid `any` and `unknown` types in all production code. Use concrete interfaces/types or shared DTOs from `@patriotchat/shared` instead.
- **DTO-first**: All cross-service messages (chat messages, prompts, session objects, model metadata) must be defined in `libs/shared` and exported as named types/interfaces.
- **Explicit types everywhere**: Functions, class properties, module exports, and public APIs must have explicit type annotations. Prefer `interface`/`type` aliases for DTOs, and `Readonly`/`ReadonlyArray` where mutation should be prevented.
- **Typing exceptions**: Temporary exceptions during prototyping are allowed but must be documented in the PR and converted to typed APIs before merging to `master`.

Enforcement:

- ESLint rules enforce `no-explicit-any`, ban `unknown`, and require explicit type annotations (`@typescript-eslint/typedef`).
- CI runs a typed linter job; PRs must pass the typed-lint before merge.

### Onboarding (quick start)

- Install dependencies: `pnpm install` (this installs dev tools and runs `prepare` to install Husky hooks).
- If hooks are missing: run `pnpm run prepare` to install Husky locally.
- Local checks you should run before opening a PR:
  - `pnpm run lint` (fast checks)
  - `pnpm run lint:typed` (full typed ESLint run — may be slower)
  - `pnpm run lint:rule-tests:typed-lint` (validates the CI typed rules locally)
- If a typed-lint failure appears, fix the issue or request an exception per the exception process below.

### Exception process

- Add a short **Typing exception** section in the PR description explaining why the exception is needed and how long it will last.
- Tag an approver from `CODEOWNERS` and add an entry to `documentation/GOVERNANCE.md` referencing the PR and rationale.
- Exceptions should have an owner and an expiry and be corrected before merging to `master` where possible.

### Example: DTO in `libs/shared`

```typescript
export interface ChatMessageDto {
  id: string;
  userId: string;
  text: string;
  timestamp: string; // ISO 8601
}
```

### Example: Avoid `any`

```typescript
// Bad
function process(input: any) { return input; }

// Good
function process(input: ChatMessageDto): ChatMessageDto { return input; }
```

### Component Configuration Example

```typescript
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
  standalone: false  // CRITICAL: Must always be explicitly set to false for all components
})
export class ExampleComponent implements OnInit {
  // Component implementation
  constructor() {}

  ngOnInit(): void {}
}
```

### Module Configuration Example

```typescript
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module'; // Example shared module
import { ExampleComponent } from './example.component';
import { OtherComponent } from './other.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    ExampleComponent,  // Always declare components here
    OtherComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatButtonModule,  // Explicitly import all needed Angular Material modules
    MatIconModule     // rather than using CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [
    ExampleComponent  // Export components intended for use outside this module
  ]
})
export class FeatureModule { }
```

## Real-Time Communication Standards

### Socket.IO Implementation

When implementing Socket.IO functionality, follow these standards:

```typescript
// Backend Socket Emission (NestJS)
import { Injectable } from '@nestjs/common';
import { SocketService } from '../socket/socket.service'; // Assuming SocketService exists

@Injectable()
export class DataService {
  constructor(private socketService: SocketService) {}

  updateData(data: any): void {
    // Process data
    // ...

    // Emit to clients - use specific, namespaced event names
    this.socketService.emitToAll('data:update', data);
  }
}

// Frontend Socket Reception (Angular)
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { SocketClientService } from './socket-client.service'; // Assuming SocketClientService exists
import { DataType } from '../models/data-type.model'; // Assuming DataType model exists

@Injectable({
  providedIn: 'root'
})
export class DataFacade implements OnDestroy {
  private dataSubject = new BehaviorSubject<DataType[]>([]);
  readonly data$ = this.dataSubject.asObservable();
  private destroyed$ = new Subject<void>();

  constructor(private socketClient: SocketClientService) {
    // Subscribe to socket events
    this.socketClient.on<DataType[]>('data:update')
      .pipe(
        takeUntil(this.destroyed$),
        // Compare stringified versions for deep equality check if needed
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
      )
      .subscribe(data => {
        this.dataSubject.next(data);
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
```

### When to Use Sockets vs. HTTP

| Data Characteristic          | Recommended Approach        | Rationale                                           |
|------------------------------|-----------------------------|-----------------------------------------------------|
| High frequency updates       | Socket.IO                   | Efficient for real-time, continuous data streams    |
| Large initial dataset        | HTTP + Socket for updates   | Load bulk data via HTTP, push changes via Socket.IO |
| User-specific updates        | Socket.IO with rooms/users  | Target specific clients without broadcasting        |
| Infrequent updates           | Traditional HTTP (Polling)  | Simpler, less overhead for non-real-time data       |
| Critical transactions        | HTTP with confirmation      | Ensures delivery and allows for transactional logic |
| Collaborative features       | Socket.IO                   | Essential for real-time multi-user interactions     |
| Server-sent events (SSE)     | HTTP (SSE)                  | Suitable for one-way server-to-client push          |

### Socket Event Naming Conventions

Socket events should use a consistent, namespaced approach with colon separators to avoid collisions and improve clarity:

- **Format:** `domain:entity:action`
- **Examples:**
  - `chat:message:new`
  - `user:profile:updated`
  - `order:status:changed`
  - `admin:logs:stream`
  - `finance:stock:priceUpdate`

See [SOCKET-SERVICES.md](./architecture/websocket/SOCKET-SERVICES.md) for more detailed implementation guidelines and best practices related to WebSocket communication.

## Large Dataset Handling

### Server-Side vs. Client-Side Rendering

For optimal performance with large datasets, follow these guidelines:

- For datasets under 100,000 records: Use client-side rendering with full dataset loaded
- For datasets over 100,000 records: Use server-side rendering with pagination
  
### Implementation Pattern

```typescript
// Backend Service (NestJS)
@Injectable()
export class RecordService {
  async getRecords(page: number, pageSize: number, total: number): Promise<RecordResponse> {
    // If total exceeds threshold, use server-side pagination
    if (total > 100000) {
      return this.getServerSidePaginatedRecords(page, pageSize);
    }
    
    // Otherwise, return full dataset for client-side handling
    return this.getAllRecords(total);
  }
  
  private async getServerSidePaginatedRecords(page: number, pageSize: number): Promise<RecordResponse> {
    // Calculate offset
    const skip = page * pageSize;
    
    // Fetch only the required chunk from database
    const records = await this.recordRepository.find({
      take: pageSize,
      skip: skip,
      order: { id: 'ASC' }
    });
    
    // Get total count for pagination info
    const totalCount = await this.recordRepository.count();
    
    return {
      records,
      totalCount,
      serverSidePagination: true
    };
  }
  
  private async getAllRecords(total: number): Promise<RecordResponse> {
    // Generate or fetch all records
    const records = await this.generateMockRecords(total);
    
    return {
      records,
      totalCount: records.length,
      serverSidePagination: false
    };
  }
}

// Angular Component
@Component({...})
export class RecordListComponent implements OnInit {
  // Properties
  dataSource: MatTableDataSource<Record> | null = null;
  serverSidePagination = false;
  
  // Handle pagination
  onTableChange(event: PageEvent): void {
    if (this.serverSidePagination) {
      // For server-side pagination, fetch only the required page
      this.recordService.getRecords(event.pageIndex, event.pageSize, this.totalRecords)
        .pipe(takeUntil(this.destroy$))
        .subscribe(response => {
          this.dataSource.data = response.records;
        });
    } else {
      // For client-side pagination, Angular Material handles it automatically
      // No additional action required
    }
  }
  
  // Switch between servers or dataset sizes
  onDatasetChange(size: number): void {
    this.totalRecords = size;
    this.serverSidePagination = size > 100000;
    
    // Reset to first page when changing dataset size
    if (this.paginator) {
      this.paginator.firstPage();
    }
    
    // Fetch records with new parameters
    this.fetchRecords();
  }
}
```

## Project-wide Standards

- If automation scripts are reintroduced, keep a shared prep step and consistent output conventions.

## Design Standards

- Use `em` for sizing and spacing by default (padding, margin, gaps, widths, heights, font sizes).
- Keep `px` for hairline details and optical effects (borders, outlines, shadows, and similar 1–2px treatments).
- Keep layout breakpoints in `px` to preserve responsive behavior.

## Operational Expectations

- Tie every change to CI gates that run `pnpm nx lint frontend api shared`, `pnpm nx test api`, and (when defined) `pnpm nx test heavy` so DTO contracts, guardrails, and formatting stay enforced.
- Document key metrics such as inference latency, hallucination rate, guardrail pass rate, and end-to-end test coverage in `documentation/METRICS.md`; add onboarding references to promote monitoring and alerts.
- Treat dataset versioning, licensing metadata, and guardrail updates as governed artifacts by linking them to approvals and change logs; provide dataset owners with a checklist before each release.
- Keep security, legal, and ethics assessments explicit in `SECURITY.md` and a dedicated governance log so the political alignment strategy remains auditable.
- When automation scripts change, ensure shared prep and output conventions (as outlined in the project-wide standards) continue to run inside Nx targets or automated workflows.
- Audit focus: call/response telemetry, DTO validation per transport, public/anonymous content filtering (illegal content detection, takedown logging), dataset provenance, and model checkpoint traceability. Include alerts for metric breaches (latency, hallucination, guardrail failure) and log anonymized violations for review.
- Tie every change to CI gates that run `pnpm nx lint frontend api shared`, `pnpm nx test api`, and (when defined) `pnpm nx test heavy` so DTO contracts, guardrails, and formatting stay enforced.
- Document key metrics such as inference latency, hallucination rate, guardrail pass rate, and end-to-end test coverage in `documentation/METRICS.md`; add onboarding references to promote monitoring and alerts.
- Treat dataset versioning, licensing metadata, and guardrail updates as governed artifacts by linking them to approvals and change logs; provide dataset owners with a checklist before each release.
- Keep security, legal, and ethics assessments explicit in `SECURITY.md` and a dedicated governance log so the political alignment strategy remains auditable.
- When automation scripts change, ensure shared prep and output conventions (as outlined in the project-wide standards) continue to run inside Nx targets or automated workflows.

Last Updated: 2026-01-05
