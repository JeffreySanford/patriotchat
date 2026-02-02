# Distributed Tracing: W3C Trace Context Implementation

**Purpose:** Implement distributed tracing with W3C Trace Context headers for request correlation across all services

**Created:** 2026-02-02  
**Status:** Architecture & Implementation Planning

---

## 🎯 Overview

Distributed tracing allows correlating all logs, metrics, and events for a single user request across multiple services:

```text
User Request
    ↓
frontend-interceptor (assigns traceId)
    ↓ X-Trace-ID: 550e8400-e29b-41d4-a716-446655440000
api-controller (receives, propagates traceId)
    ↓ X-Trace-ID: 550e8400-e29b-41d4-a716-446655440000
go-query-handler (receives, propagates traceId)
    ↓ X-Trace-ID: 550e8400-e29b-41d4-a716-446655440000
ollama-inference (receives traceId, completes request)
    ↓
All logs/metrics/traces tagged with same traceId
→ Can correlate entire request flow in Logger UI
```

---

## 📋 W3C Trace Context Specification

### HTTP Headers

**Primary Header: `traceparent`**

```text
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
              └──┘ └──────────────────────────────────────┘ └──────┘ └┘
              Version  Trace ID (32 hex chars)               Span ID  Flags
```

**Secondary Headers (Optional): `tracestate`**

```text
tracestate: vendor1=opaqueValue1,vendor2=opaqueValue2
```

### PatriotChat Simplified Headers

For simplicity, use custom headers:

```text
X-Trace-ID: 550e8400-e29b-41d4-a716-446655440000 (UUID v4)
X-Span-ID: span-001
X-Parent-Span-ID: (optional, for nested calls)
X-Trace-Flags: 01 (always sampled for dev)
```

---

## 🔧 Implementation by Service

### 1. Frontend Interceptor (Angular)

```typescript
// src/interceptors/trace.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TraceInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Generate trace ID for new requests, reuse for retries
    const traceId = req.headers.get('X-Trace-ID') || uuidv4();
    const spanId = `span-${Math.random().toString(36).substr(2, 9)}`;

    // Clone request with trace headers
    const tracedReq = req.clone({
      setHeaders: {
        'X-Trace-ID': traceId,
        'X-Span-ID': spanId,
        'X-Trace-Flags': '01' // Always sampled in dev
      }
    });

    // Log request initiation
    console.log(`[${traceId}] ${req.method} ${req.url}`);

    const startTime = performance.now();

    return next.handle(tracedReq).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const duration = performance.now() - startTime;
          console.log(
            `[${traceId}] ${req.method} ${req.url} ` +
            `${event.status} ${duration.toFixed(0)}ms`
          );
        }
      }),
      catchError((error: any) => {
        const duration = performance.now() - startTime;
        console.error(
          `[${traceId}] ${req.method} ${req.url} ` +
          `ERROR ${error.status || 'UNKNOWN'} ${duration.toFixed(0)}ms`,
          error
        );
        throw error;
      })
    );
  }
}

// Register in app.module.ts
providers: [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: TraceInterceptor,
    multi: true
  }
]
```

### 2. API Controller (NestJS)

```typescript
// src/middleware/trace.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../services/logger.service';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Extract or generate trace ID
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
    const parentSpanId = req.headers['x-span-id'] as string;
    const spanId = `span-${Math.random().toString(36).substr(2, 9)}`;

    // Store in request context for service access
    req['traceId'] = traceId;
    req['spanId'] = spanId;
    req['parentSpanId'] = parentSpanId;

    // Attach trace headers to response
    res.setHeader('X-Trace-ID', traceId);
    res.setHeader('X-Span-ID', spanId);

    // Log request
    const startTime = Date.now();
    this.logger.info(
      `${req.method} ${req.path}`,
      { traceId, spanId, parentSpanId, method: req.method, path: req.path }
    );

    // Intercept response finish
    const originalSend = res.send.bind(res);
    res.send = function(data) {
      const duration = Date.now() - startTime;
      const logLevel = res.statusCode >= 500 ? 'error' : 
                       res.statusCode >= 400 ? 'warn' : 
                       'info';

      Logger[logLevel](
        `${req.method} ${req.path} ${res.statusCode} ${duration}ms`,
        {
          traceId,
          spanId,
          parentSpanId,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          latencyMs: duration
        }
      );

      return originalSend(data);
    };

    next();
  }
}

// Register in app.module.ts
app.use(TraceMiddleware);
```

### 3. Go Query Handler

```go
// middleware/trace.go
package middleware

import (
 "fmt"
 "net/http"
 "time"
 "github.com/google/uuid"
 "log"
)

func TraceMiddleware(next http.Handler) http.Handler {
 return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
  // Extract or generate trace ID
  traceId := r.Header.Get("X-Trace-ID")
  if traceId == "" {
   traceId = uuid.New().String()
  }
  spanId := fmt.Sprintf("span-%d", time.Now().UnixNano())
  parentSpanId := r.Header.Get("X-Span-ID")

  // Store in request context
  r.Header.Set("X-Trace-ID", traceId)
  r.Header.Set("X-Span-ID", spanId)
  r.Header.Set("X-Parent-Span-ID", parentSpanId)

  // Add trace headers to response
  w.Header().Set("X-Trace-ID", traceId)
  w.Header().Set("X-Span-ID", spanId)

  // Log request
  startTime := time.Now()
  log.Printf("[%s] %s %s", traceId, r.Method, r.RequestURI)

  // Wrap response writer to capture status
  rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

  // Call next handler
  next.ServeHTTP(rw, r)

  // Log response
  duration := time.Since(startTime).Milliseconds()
  logLevel := "INFO"
  if rw.statusCode >= 500 {
   logLevel = "ERROR"
  } else if rw.statusCode >= 400 {
   logLevel = "WARN"
  }

  log.Printf(
   "[%s] %s %s %d %dms",
   traceId,
   logLevel,
   r.Method,
   rw.statusCode,
   duration,
  )
 })
}

type responseWriter struct {
 http.ResponseWriter
 statusCode int
 written    bool
}

func (rw *responseWriter) WriteHeader(code int) {
 rw.statusCode = code
 rw.ResponseWriter.WriteHeader(code)
 rw.written = true
}

func (rw *responseWriter) Write(b []byte) (int, error) {
 if !rw.written {
  rw.WriteHeader(http.StatusOK)
 }
 return rw.ResponseWriter.Write(b)
}
```

### 4. Ollama Inference Service

```python
# middleware/trace.py
import uuid
import time
from flask import request, g
from datetime import datetime

def init_trace_middleware(app):
    @app.before_request
    def before_request():
        # Extract or generate trace ID
        trace_id = request.headers.get('X-Trace-ID', str(uuid.uuid4()))
        span_id = f"span-{int(time.time() * 1000000) % 1000000}"
        parent_span_id = request.headers.get('X-Span-ID')

        # Store in Flask g object for access in handlers
        g.trace_id = trace_id
        g.span_id = span_id
        g.parent_span_id = parent_span_id
        g.request_start_time = time.time()

        print(f"[{trace_id}] {request.method} {request.path}")

    @app.after_request
    def after_request(response):
        # Calculate latency
        duration_ms = int((time.time() - g.request_start_time) * 1000)

        # Log response
        log_level = "ERROR" if response.status_code >= 500 else \
                    "WARN" if response.status_code >= 400 else \
                    "INFO"

        print(
            f"[{g.trace_id}] {log_level} {request.method} "
            f"{request.path} {response.status_code} {duration_ms}ms"
        )

        # Add trace headers to response
        response.headers['X-Trace-ID'] = g.trace_id
        response.headers['X-Span-ID'] = g.span_id

        return response

    return app
```

---

## 📊 Trace Storage & Querying

### Trace Document Structure

```typescript
interface TraceDocument {
  traceId: string;           // Primary key for queries
  spans: Span[];             // All spans in order
  totalDurationMs: number;
  status: 'OK' | 'ERROR';
  startTime: Date;
  endTime: Date;
  attributes: {
    userId: string;
    userAgent: string;
    ipAddress: string;
    path: string;
    httpMethod: string;
  };
  events?: TraceEvent[];     // Timeline of significant events
}

interface Span {
  spanId: string;
  parentSpanId?: string;
  serviceId: 'frontend-interceptor' | 'api-controller' | 'go-query-handler' | 'ollama-inference';
  operationName: string;
  startTime: Date;
  endTime: Date;
  durationMs: number;
  status: 'OK' | 'ERROR';
  attributes?: Record<string, any>;
  events?: SpanEvent[];
}

interface TraceEvent {
  name: string;
  timestamp: Date;
  attributes?: Record<string, any>;
}
```

### MongoDB Query Examples

```javascript
// Find trace by ID
db.traces.findOne({ traceId: '550e8400-e29b-41d4-a716-446655440000' })

// Find all traces for a user in last hour
db.traces.find({
  'attributes.userId': 'user-123',
  startTime: { $gte: new Date(Date.now() - 3600000) }
}).sort({ startTime: -1 })

// Find slow traces (> 5 seconds)
db.traces.find({
  totalDurationMs: { $gt: 5000 },
  startTime: { $gte: new Date(Date.now() - 86400000) }
}).sort({ totalDurationMs: -1 })

// Find error traces
db.traces.find({
  status: 'ERROR',
  startTime: { $gte: new Date(Date.now() - 3600000) }
})

// Analyze span latencies
db.traces.aggregate([
  { $match: { status: 'OK' } },
  { $unwind: '$spans' },
  { $group: {
      _id: '$spans.serviceId',
      avgLatency: { $avg: '$spans.durationMs' },
      maxLatency: { $max: '$spans.durationMs' },
      count: { $sum: 1 }
    }
  },
  { $sort: { avgLatency: -1 } }
])
```

---

## 🖥️ Logger UI: Trace Visualization

### UI Components

**Trace Explorer Page:**

```text
┌─────────────────────────────────────────────┐
│ Trace ID: 550e8400-e29b-41d4-...  [Copy]   │
├─────────────────────────────────────────────┤
│ Status: OK          Duration: 5450ms        │
│ Start: 10:00:00     End: 10:00:05.450      │
├─────────────────────────────────────────────┤
│ User: user-123      IP: 192.168.1.100      │
├─────────────────────────────────────────────┤
│ TIMELINE                                    │
├─────────────────────────────────────────────┤
│ frontend-interceptor    [━━━━━━━━━━━] 5.4s │
│   ├─ api-controller     [━━━━━━━] 4.1s    │
│   │   ├─ ollama-inference [━━━━] 3.2s    │
│   │   └─ Database query   [━] 0.2s      │
│   └─ Response           [░] 0.1s         │
├─────────────────────────────────────────────┤
│ RELATED LOGS                                │
├─────────────────────────────────────────────┤
│ [INFO] frontend-interceptor: Request sent   │
│ [INFO] api-controller: Query received       │
│ [INFO] ollama-inference: Inference complete│
│ [INFO] api-controller: Response prepared   │
│ [INFO] frontend-interceptor: Response OK   │
└─────────────────────────────────────────────┘
```

**Queries by Service:**

```typescript
// frontend-interceptor.service.ts
getTracesForService(serviceId: string, timeRange?: TimeRange) {
  return this.http.get(`/api/traces`, {
    params: {
      serviceId,
      ...(timeRange && {
        startTime: timeRange.start.toISOString(),
        endTime: timeRange.end.toISOString()
      })
    }
  });
}

// Get slow traces
getSlowTraces(durationMinMs: number = 5000) {
  return this.http.get(`/api/traces/slow`, {
    params: { minDurationMs: durationMinMs }
  });
}

// Get error traces
getErrorTraces(timeRange?: TimeRange) {
  return this.http.get(`/api/traces/errors`, {
    params: {
      ...(timeRange && {
        startTime: timeRange.start.toISOString(),
        endTime: timeRange.end.toISOString()
      })
    }
  });
}
```

---

## 🔍 Trace Lifecycle

### Request → Trace Storage

```text
1. USER INITIATES REQUEST
   └─ Browser sends HTTP request
   
2. FRONTEND INTERCEPTOR
   └─ Generates UUID traceId
   └─ Adds X-Trace-ID header
   └─ Creates initial log entry
   
3. API CONTROLLER
   └─ Receives X-Trace-ID header
   └─ Creates span-002
   └─ Logs request with traceId
   └─ Creates new span ID for downstream call
   
4. GO QUERY HANDLER
   └─ Receives X-Trace-ID header
   └─ Receives X-Span-ID from API
   └─ Creates span-003
   └─ Calls Ollama service with X-Trace-ID
   
5. OLLAMA INFERENCE
   └─ Receives X-Trace-ID header
   └─ Processes request
   └─ Returns response with headers
   
6. TRACE COLLECTION
   └─ All services log with same traceId
   └─ Logs collection has entries with traceId
   └─ Traces collection has complete trace document
   └─ Metrics collection has latency measurements
   
7. QUERY TIME (Logger UI)
   └─ User searches by traceId
   └─ MongoDB returns trace document + related logs
   └─ UI renders timeline visualization
```

---

## ⚡ Performance Considerations

### Header Propagation

```typescript
// ✅ CORRECT: Always propagate trace headers
const tracedHeaders = {
  'X-Trace-ID': parentTraceId,
  'X-Span-ID': currentSpanId,
  'X-Parent-Span-ID': parentSpanId,
  ...otherHeaders
};

httpClient.post('/downstream', data, { headers: tracedHeaders });

// ❌ WRONG: Losing trace context
httpClient.post('/downstream', data); // Headers lost!
```

### Async Operations

```typescript
// For async operations, preserve trace context
async function processWithTrace(traceId: string, data: any) {
  // Context is preserved in async context
  return await asyncOperation(data, { traceId });
}

// For long-running operations, manually track
const traceContext = {
  traceId: '550e8400-e29b-41d4-a716-446655440000',
  spanId: 'span-001',
  startTime: Date.now()
};

setTimeout(() => {
  logger.info('Async work complete', {
    ...traceContext,
    durationMs: Date.now() - traceContext.startTime
  });
}, 5000);
```

---

## 🧪 Testing Traces

```typescript
// test/trace.integration.spec.ts
describe('Distributed Tracing', () => {
  it('should propagate traceId across services', async () => {
    // Make request with explicit traceId
    const traceId = 'test-trace-001';
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: { 'X-Trace-ID': traceId },
      body: JSON.stringify({ query: 'test' })
    });

    // Verify response has trace headers
    expect(response.headers.get('X-Trace-ID')).toBe(traceId);

    // Query database for complete trace
    const trace = await db.traces.findOne({ traceId });
    expect(trace).toBeDefined();
    expect(trace.spans).toHaveLength(3); // 3 services
    expect(trace.status).toBe('OK');
    expect(trace.totalDurationMs).toBeLessThan(10000);

    // Verify all logs have same traceId
    const logs = await db.logs.find({ traceId }).toArray();
    expect(logs.length).toBeGreaterThan(0);
    logs.forEach(log => {
      expect(log.traceId).toBe(traceId);
    });
  });

  it('should handle trace errors correctly', async () => {
    const traceId = 'test-trace-error-001';
    const response = await fetch('/api/query', {
      method: 'POST',
      headers: { 'X-Trace-ID': traceId },
      body: JSON.stringify({ query: 'invalid' })
    });

    // Error trace should be recorded
    const trace = await db.traces.findOne({ traceId });
    expect(trace.status).toBe('ERROR');
    
    // Error span should be marked
    const errorSpan = trace.spans.find(s => s.status === 'ERROR');
    expect(errorSpan).toBeDefined();
  });
});
```

---

## ✅ Implementation Checklist

- [ ] Frontend interceptor adds X-Trace-ID header
- [ ] API controller receives and propagates headers
- [ ] Go handler propagates to downstream services
- [ ] Ollama service receives headers
- [ ] All services log with traceId
- [ ] Traces collection stores complete spans
- [ ] Logger UI displays traces with timeline
- [ ] Trace queries work (by ID, by service, slow, errors)
- [ ] Performance: No significant overhead from tracing
- [ ] Tests validate trace propagation
- [ ] Team documentation complete

---

**Next Steps:**

1. Implement middleware in each service
2. Test header propagation end-to-end
3. Verify traces stored in MongoDB
4. Build Logger UI trace visualization
5. Load test with distributed tracing enabled
6. Document trace analysis patterns
