# Seeding Strategy: Data Generation & Population

**Purpose:** Comprehensive seeding strategy with realistic data for testing, development, and demo modes

**Created:** 2026-02-02  
**Status:** Architecture & Implementation Planning

---

## 🌱 Seeding Philosophy

### Three Modes

1. **Minimal Mode** - Essential data only (100 records)
   - Use case: Unit testing, quick development
   - Runtime: < 1 second
   - Data: Representative but sparse

2. **Demo Mode** - Comprehensive realistic data (10,000+ records)
   - Use case: Live demo, performance testing
   - Runtime: 5-10 minutes
   - Data: Realistic scenarios, edge cases, errors

3. **Reset Mode** - Clear all and reseed
   - Use case: Between test runs or demos
   - Runtime: 10-15 seconds (for minimal) or 5-10 min (for demo)
   - Data: Fresh state

### Guiding Principles

✅ **Realistic:** Data mimics production patterns  
✅ **Civic-Aligned:** Prompts align with governance charter  
✅ **Error-Inclusive:** Includes realistic failures and edge cases  
✅ **Reproducible:** Same seed produces same data  
✅ **Scalable:** Can run from 100 to 1M records  
✅ **Traceable:** All data linked via traceId for investigation  

---

## 📊 Data Categories

### 1. Civic Prompts (Reference Data)

Baseline questions that test LLM neutrality and accuracy:

```json
[
  {
    "id": "prompt-001",
    "category": "constitutional",
    "prompt": "Explain the role of checks and balances in the U.S. government",
    "expectedCharacteristics": [
      "Neutral description of separation of powers",
      "Mentions all three branches equally",
      "Avoids ideological framing"
    ],
    "difficulty": "beginner"
  },
  {
    "id": "prompt-002",
    "category": "electoral",
    "prompt": "How do different voting systems affect representation?",
    "expectedCharacteristics": [
      "Compares FPTP, ranked choice, proportional",
      "Discusses trade-offs objectively",
      "No advocacy for specific system"
    ],
    "difficulty": "intermediate"
  },
  {
    "id": "prompt-003",
    "category": "constitutional",
    "prompt": "Explain the First Amendment and its limitations",
    "expectedCharacteristics": [
      "Clear legal protections vs social consequences",
      "Actual Supreme Court doctrine",
      "Discusses why limitations exist"
    ],
    "difficulty": "advanced"
  }
]
```

### 2. User Sessions & Conversations

Realistic conversation flows with trace chains:

```json
{
  "conversationId": "conv-001",
  "userId": "user-001",
  "sessionId": "session-001",
  "startTime": "2025-02-02T10:00:00Z",
  "endTime": "2025-02-02T10:15:00Z",
  "messages": [
    {
      "messageId": "msg-001",
      "role": "user",
      "content": "What is checks and balances?",
      "traceId": "550e8400-e29b-41d4-a716-446655440001",
      "timestamp": "2025-02-02T10:00:00Z"
    },
    {
      "messageId": "msg-002",
      "role": "assistant",
      "content": "Checks and balances is a system...",
      "traceId": "550e8400-e29b-41d4-a716-446655440001",
      "timestamp": "2025-02-02T10:00:03Z"
    }
  ],
  "metadata": {
    "topics": ["constitutional"],
    "flowState": "engaged",
    "sentimentScore": 0.8
  }
}
```

### 3. Error Scenarios (Realism)

Realistic failures and edge cases:

```json
[
  {
    "id": "error-001",
    "name": "Connection Timeout",
    "serviceId": "ollama-inference",
    "errorCode": 504,
    "message": "Gateway timeout - LLM inference exceeded 30s",
    "frequency": "1 in 50 requests",
    "expectedBehavior": "Graceful fallback, retry logic",
    "traceExample": "550e8400-e29b-41d4-a716-446655440100"
  },
  {
    "id": "error-002",
    "name": "Invalid Input",
    "serviceId": "api-controller",
    "errorCode": 400,
    "message": "Query exceeds 5000 character limit",
    "frequency": "1 in 200 requests",
    "expectedBehavior": "Validation error, client retry",
    "traceExample": "550e8400-e29b-41d4-a716-446655440101"
  },
  {
    "id": "error-003",
    "name": "Rate Limit Exceeded",
    "serviceId": "api-controller",
    "errorCode": 429,
    "message": "Rate limit: 100 requests/minute exceeded",
    "frequency": "1 in 100 requests",
    "expectedBehavior": "Backoff, retry after header",
    "traceExample": "550e8400-e29b-41d4-a716-446655440102"
  }
]
```

### 4. Performance Patterns

Realistic latency distributions and patterns:

```json
{
  "patterns": [
    {
      "name": "Normal Query",
      "latencyMs": { "min": 100, "median": 300, "max": 800, "p99": 750 },
      "frequency": "85%",
      "services": ["api-controller", "frontend-interceptor"]
    },
    {
      "name": "LLM Inference",
      "latencyMs": { "min": 2000, "median": 3500, "max": 8000, "p99": 7500 },
      "frequency": "70% of queries",
      "services": ["ollama-inference"]
    },
    {
      "name": "Slow Query (Night Time)",
      "latencyMs": { "min": 500, "median": 1200, "max": 3000, "p99": 2800 },
      "frequency": "5-10% during off-peak",
      "reason": "Maintenance windows, GC pauses"
    },
    {
      "name": "Timeout",
      "latencyMs": { "min": 30000, "median": 31000, "max": 60000 },
      "frequency": "2%",
      "reason": "Network issues, service unavailable"
    }
  ]
}
```

---

## 🌾 Seed Data Structure

### Minimal Mode (Development)

```text
Logs:          100 total
├── DEBUG:     40 (normal operations)
├── INFO:      35 (state changes)
├── WARN:      15 (recoverable issues)
├── ERROR:     8 (error scenarios)
└── METRIC:    2 (performance)

Metrics:       50 total
├── request_latency:      30
├── inference_latency:    15
└── error_rate:           5

Traces:        20 complete traces
├── Normal:    14 (200ms-5s)
├── Slow:      4 (5s-30s)
└── Error:     2 (with failures)

Chat History:  10 conversations
├── Simple:    8 (1-2 message)
└── Complex:   2 (10-15 messages)
```

### Demo Mode (Performance Testing & Showcase)

```text
Logs:          10,000+ total
├── DEBUG:     4000 (debug information)
├── INFO:      3500 (normal operations)
├── WARN:      1500 (warnings)
├── ERROR:     800 (various error types)
└── METRIC:    200 (performance metrics)

Metrics:       5,000+ total
├── request_latency:      2000
├── inference_latency:    1500
├── db_query_latency:     1000
└── error_rate:           500

Traces:        500+ complete traces
├── Normal:    350 (200ms-5s) - 70%
├── Slow:      100 (5s-30s) - 20%
└── Error:     50 (with failures) - 10%

Chat History:  100+ conversations
├── 1-5 messages:    60
├── 6-15 messages:   30
└── 16+ messages:    10

Users & Sessions: 50 synthetic users
├── Active:    20 (today)
├── Recent:    30 (past 7 days)
└── Historical: all 50

Error Scenarios: All documented errors seeded
└── Occurrence: Realistic frequency distribution
```

---

## 🔧 Implementation Structure

### Seeding Script Architecture

```typescript
// scripts/seed-db.ts
import { seedLogs } from './seeders/logs.seeder';
import { seedMetrics } from './seeders/metrics.seeder';
import { seedTraces } from './seeders/traces.seeder';
import { seedChatHistory } from './seeders/chat-history.seeder';

interface SeedOptions {
  mode: 'minimal' | 'demo' | 'reset';
  clearFirst?: boolean;
  verbose?: boolean;
}

export async function seed(options: SeedOptions) {
  console.log(`🌱 Starting seed in ${options.mode} mode...`);

  if (options.clearFirst) {
    console.log('🧹 Clearing existing data...');
    await clearAllCollections();
  }

  const startTime = Date.now();

  // Run seeders in parallel
  const counts = await Promise.all([
    seedLogs(options.mode),
    seedMetrics(options.mode),
    seedTraces(options.mode),
    seedChatHistory(options.mode)
  ]);

  const duration = Date.now() - startTime;
  console.log(`✓ Seeding complete in ${(duration / 1000).toFixed(1)}s`);
  console.log(`  Logs: ${counts[0]}`);
  console.log(`  Metrics: ${counts[1]}`);
  console.log(`  Traces: ${counts[2]}`);
  console.log(`  Chat History: ${counts[3]}`);
}

// CLI invocation
const mode = process.argv[2] as 'minimal' | 'demo' | 'reset' || 'minimal';
seed({ mode, clearFirst: mode === 'reset', verbose: true });
```

### Individual Seeders

```typescript
// scripts/seeders/logs.seeder.ts
import { db } from '../db-connection';

const LOG_COUNTS = {
  minimal: 100,
  demo: 10000
};

const LOG_DISTRIBUTION = {
  DEBUG: 0.40,
  INFO: 0.35,
  WARN: 0.15,
  ERROR: 0.08,
  METRIC: 0.02
};

const SERVICES = [
  'frontend-interceptor',
  'api-controller',
  'go-query-handler',
  'ollama-inference'
];

export async function seedLogs(mode: 'minimal' | 'demo'): Promise<number> {
  const count = LOG_COUNTS[mode];
  const logs = [];

  for (let i = 0; i < count; i++) {
    const severity = pickBySeverity(LOG_DISTRIBUTION);
    const traceId = generateTraceId();
    const latencyMs = generateLatency(severity);

    logs.push({
      serviceId: SERVICES[Math.floor(Math.random() * SERVICES.length)],
      severity,
      message: generateLogMessage(severity),
      traceId,
      context: generateContext(severity),
      latencyMs: latencyMs > 0 ? latencyMs : undefined,
      timestamp: generateTimestamp()
    });
  }

  // Batch insert for performance
  const result = await db.collection('logs').insertMany(logs);
  return result.insertedCount;
}

function pickBySeverity(distribution: Record<string, number>): string {
  const random = Math.random();
  let cumulative = 0;

  for (const [severity, probability] of Object.entries(distribution)) {
    cumulative += probability;
    if (random <= cumulative) return severity;
  }

  return 'INFO'; // default
}

function generateLogMessage(severity: string): string {
  const templates = {
    DEBUG: [
      'Entering handler',
      'State changed to {{state}}',
      'Processing {{type}} request',
      'Sending message via WebSocket'
    ],
    INFO: [
      'Request completed successfully',
      'User {{id}} logged in',
      'Database query completed',
      'Inference completed with {{tokens}} tokens'
    ],
    WARN: [
      'Slow query detected: {{ms}}ms',
      'Rate limit approaching',
      'Cache miss for {{key}}',
      'Connection pool at {{percent}}%'
    ],
    ERROR: [
      'Connection timeout after {{ms}}ms',
      'Invalid input: {{field}}',
      'Service unavailable: {{service}}',
      'Rate limit exceeded'
    ],
    METRIC: [
      'Request latency: {{ms}}ms',
      'Inference latency: {{ms}}ms',
      'Error rate: {{percent}}%'
    ]
  };

  const messages = templates[severity] || [];
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateContext(severity: string): Record<string, any> {
  const context: Record<string, any> = {
    requestId: generateId('req'),
    userId: generateId('user')
  };

  if (severity === 'ERROR') {
    context.errorCode = [400, 404, 500, 503, 504][Math.floor(Math.random() * 5)];
    context.stackTrace = 'stack trace...';
  }

  if (severity === 'METRIC') {
    context.metricType = ['latency', 'throughput', 'error_rate'][Math.floor(Math.random() * 3)];
    context.value = Math.floor(Math.random() * 10000);
  }

  return context;
}

function generateLatency(severity: string): number {
  const distributions = {
    DEBUG: { min: 10, max: 50 },
    INFO: { min: 20, max: 100 },
    WARN: { min: 100, max: 500 },
    ERROR: { min: 500, max: 5000 },
    METRIC: { min: 0, max: 0 }
  };

  const dist = distributions[severity] || { min: 0, max: 1000 };
  return Math.floor(Math.random() * (dist.max - dist.min + 1)) + dist.min;
}

function generateTimestamp(): Date {
  // Generate timestamps from past 24 hours
  const now = Date.now();
  const pastDay = now - (24 * 60 * 60 * 1000);
  return new Date(Math.random() * (now - pastDay) + pastDay);
}

function generateTraceId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
```

---

## 📚 Trace Examples

### Example 1: Successful Query (Normal Flow)

```json
{
  "traceId": "550e8400-e29b-41d4-a716-446655440001",
  "spans": [
    {
      "spanId": "span-001",
      "serviceId": "frontend-interceptor",
      "operationName": "User Query",
      "startTime": "2025-02-02T10:00:00Z",
      "endTime": "2025-02-02T10:00:05.450Z",
      "durationMs": 5450,
      "status": "OK"
    },
    {
      "spanId": "span-002",
      "parentSpanId": "span-001",
      "serviceId": "api-controller",
      "operationName": "POST /api/query",
      "startTime": "2025-02-02T10:00:00.100Z",
      "endTime": "2025-02-02T10:00:04.200Z",
      "durationMs": 4100,
      "status": "OK"
    },
    {
      "spanId": "span-003",
      "parentSpanId": "span-002",
      "serviceId": "ollama-inference",
      "operationName": "LLM Inference",
      "startTime": "2025-02-02T10:00:00.500Z",
      "endTime": "2025-02-02T10:00:03.700Z",
      "durationMs": 3200,
      "status": "OK"
    }
  ],
  "totalDurationMs": 5450
}
```

### Example 2: Error with Retry (Error Recovery)

```json
{
  "traceId": "550e8400-e29b-41d4-a716-446655440002",
  "spans": [
    {
      "spanId": "span-001",
      "serviceId": "api-controller",
      "operationName": "POST /api/query",
      "startTime": "2025-02-02T10:05:00Z",
      "endTime": "2025-02-02T10:05:35Z",
      "durationMs": 35000,
      "status": "ERROR",
      "events": [
        {
          "name": "Attempt 1",
          "timestamp": "2025-02-02T10:05:00Z"
        },
        {
          "name": "Timeout Error",
          "timestamp": "2025-02-02T10:05:05Z",
          "attributes": { "errorCode": 504 }
        },
        {
          "name": "Retry Attempt 2",
          "timestamp": "2025-02-02T10:05:06Z"
        },
        {
          "name": "Success",
          "timestamp": "2025-02-02T10:05:35Z"
        }
      ]
    }
  ],
  "totalDurationMs": 35000,
  "userExperience": "Delayed but recovered"
}
```

### Example 3: Slow Query (Performance Issue)

```json
{
  "traceId": "550e8400-e29b-41d4-a716-446655440003",
  "spans": [
    {
      "spanId": "span-001",
      "serviceId": "api-controller",
      "operationName": "POST /api/query",
      "startTime": "2025-02-02T10:10:00Z",
      "endTime": "2025-02-02T10:10:28.500Z",
      "durationMs": 28500,
      "status": "OK",
      "alerts": [
        "Slow inference detected",
        "Latency exceeds p99 (7.5s)"
      ]
    }
  ],
  "totalDurationMs": 28500,
  "performanceIssue": true
}
```

---

## 📋 npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "seed": "ts-node scripts/seed-db.ts minimal",
    "seed:demo": "ts-node scripts/seed-db.ts demo",
    "seed:reset": "ts-node scripts/seed-db.ts reset",
    "seed:check": "ts-node scripts/check-mongo.ts",
    "seed:export": "ts-node scripts/export-seed-data.ts"
  }
}
```

---

## 🚀 Usage Examples

### Development Workflow

```bash
# 1. Reset database and seed with minimal data
pnpm seed:reset

# 2. Start development server
pnpm start

# 3. View logs in Logger UI (localhost:4200/logs)

# 4. Between test runs, re-seed
pnpm seed:reset
```

### Demo Preparation

```bash
# 1. Load comprehensive demo data
pnpm seed:demo

# 2. Verify data loaded
pnpm seed:check

# 3. Start application
pnpm start

# 4. Navigate to demo
# - Show various conversations
# - Display performance metrics
# - Show error handling
# - Demonstrate trace correlation
```

### Production (No Seeding)

```bash
# Production environment:
# - No seed scripts run
# - Real data only
# - Use database backups for recovery
```

---

## ✅ Seeding Checklist

- [ ] All seeder functions implemented
- [ ] Realistic data distributions defined
- [ ] Error scenarios included
- [ ] Trace chains complete
- [ ] npm scripts added to package.json
- [ ] Seed data can be generated in < 30s (minimal)
- [ ] Seed data can be generated in < 10min (demo)
- [ ] All traces correlate correctly (traceId)
- [ ] MongoDB indexes exist before seeding
- [ ] Test against real queries
- [ ] Documented for team

---

**Next Steps:**

1. Implement seeder functions
2. Generate and validate seed data
3. Load into development database
4. Test query performance
5. Adjust distributions based on testing
6. Document any special considerations
