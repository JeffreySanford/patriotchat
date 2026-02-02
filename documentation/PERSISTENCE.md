# Persistence Infrastructure: MongoDB Setup & Schemas

**Purpose:** MongoDB database design, schemas, indexes, and connection configuration for PatriotChat persistent storage

**Created:** 2026-02-02  
**Status:** Architecture & Implementation Planning

---

## 🗄️ Database Architecture

### Storage Strategy

```text
MongoDB (Local Instance)
├── logs          (All application logs)
├── metrics       (Performance metrics, trace latencies)
├── traces        (Distributed trace records)
├── seed-data     (Civic prompts, test data)
└── chat-history  (Conversation records)
```

### Connection Configuration

**Development:**

- Host: `localhost`
- Port: `27017` (MongoDB default)
- Database: `patriotchat-dev`
- No authentication (local)
- Connection pool: 10 connections

**Production:**

- Host: `$MONGODB_HOST` (environment)
- Port: `$MONGODB_PORT` (27017)
- Database: `patriotchat`
- Authentication: SCRAM-SHA-256 (username/password)
- Connection pool: 50 connections
- Replica set: For high availability

### Connection String

```text
# Development
mongodb://localhost:27017/patriotchat-dev

# Production with auth
mongodb+srv://user:pass@mongodb-cluster.mongodb.net/patriotchat?retryWrites=true&w=majority
```

---

## 📋 Collection Schemas

### 1. Logs Collection

**Purpose:** Store all application logs from all services

```typescript
db.createCollection("logs", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["serviceId", "severity", "message", "traceId", "timestamp"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        serviceId: {
          bsonType: "string",
          enum: [
            "frontend-interceptor",
            "api-controller",
            "go-query-handler",
            "ollama-inference"
          ],
          description: "Source service"
        },
        severity: {
          bsonType: "string",
          enum: ["DEBUG", "INFO", "WARN", "ERROR", "METRIC"],
          description: "Log level"
        },
        message: {
          bsonType: "string",
          description: "Log message"
        },
        traceId: {
          bsonType: "string",
          pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
          description: "W3C Trace Context ID"
        },
        context: {
          bsonType: "object",
          description: "Additional context (userId, errorCode, etc.)"
        },
        latencyMs: {
          bsonType: "int",
          minimum: 0,
          description: "Operation latency in milliseconds"
        },
        timestamp: {
          bsonType: "date",
          description: "When log was created"
        },
        createdAt: {
          bsonType: "date",
          description: "MongoDB auto-timestamp"
        },
        updatedAt: {
          bsonType: "date",
          description: "MongoDB auto-timestamp"
        }
      }
    }
  }
})

// Indexes
db.logs.createIndex({ traceId: 1, timestamp: -1 })        // Trace queries
db.logs.createIndex({ serviceId: 1, severity: 1, timestamp: -1 }) // Filter
db.logs.createIndex({ timestamp: -1 })                     // Recent logs
db.logs.createIndex({ severity: 1 })                       // By severity
```

**Sample Document:**

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "serviceId": "api-controller",
  "severity": "ERROR",
  "message": "Query failed: connection timeout",
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "context": {
    "userId": "user-123",
    "requestId": "req-456",
    "errorCode": 500,
    "endpoint": "/api/query"
  },
  "latencyMs": 5234,
  "timestamp": ISODate("2025-02-02T14:32:15.123Z"),
  "createdAt": ISODate("2025-02-02T14:32:15.123Z"),
  "updatedAt": ISODate("2025-02-02T14:32:15.123Z")
}
```

---

### 2. Metrics Collection

**Purpose:** Store performance metrics and trace latencies

```typescript
db.createCollection("metrics", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["serviceId", "metricType", "timestamp"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        serviceId: {
          bsonType: "string",
          enum: [
            "frontend-interceptor",
            "api-controller",
            "go-query-handler",
            "ollama-inference"
          ]
        },
        metricType: {
          bsonType: "string",
          enum: [
            "request_latency",
            "inference_latency",
            "db_query_latency",
            "websocket_message_latency",
            "error_rate",
            "memory_usage",
            "cpu_usage",
            "network_throughput"
          ]
        },
        value: {
          bsonType: "number",
          description: "Metric value"
        },
        unit: {
          bsonType: "string",
          enum: ["ms", "bytes", "percent", "messages/sec", "count"],
          description: "Measurement unit"
        },
        tags: {
          bsonType: "object",
          description: "Additional metadata (endpoint, userId, etc.)"
        },
        timestamp: {
          bsonType: "date"
        }
      }
    }
  }
})

db.metrics.createIndex({ serviceId: 1, metricType: 1, timestamp: -1 })
db.metrics.createIndex({ timestamp: -1 })
db.metrics.createIndex({ metricType: 1, timestamp: -1 })
```

**Sample Documents:**

```json
[
  {
    "_id": ObjectId("507f1f77bcf86cd799439012"),
    "serviceId": "api-controller",
    "metricType": "request_latency",
    "value": 245,
    "unit": "ms",
    "tags": {
      "endpoint": "/api/query",
      "method": "POST",
      "httpStatus": 200
    },
    "timestamp": ISODate("2025-02-02T14:32:15.123Z")
  },
  {
    "_id": ObjectId("507f1f77bcf86cd799439013"),
    "serviceId": "ollama-inference",
    "metricType": "inference_latency",
    "value": 3200,
    "unit": "ms",
    "tags": {
      "model": "llama2:7b",
      "tokenCount": 256
    },
    "timestamp": ISODate("2025-02-02T14:32:20.000Z")
  }
]
```

---

### 3. Traces Collection

**Purpose:** Distributed tracing records with full request flow

```typescript
db.createCollection("traces", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["traceId", "spanId", "timestamp"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        traceId: {
          bsonType: "string",
          pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
        },
        spanId: {
          bsonType: "string",
          description: "Unique span within trace"
        },
        parentSpanId: {
          bsonType: "string",
          description: "Parent span ID (optional, for call hierarchy)"
        },
        serviceId: {
          bsonType: "string",
          enum: [
            "frontend-interceptor",
            "api-controller",
            "go-query-handler",
            "ollama-inference"
          ]
        },
        operationName: {
          bsonType: "string",
          description: "Operation name (e.g., 'POST /api/query')"
        },
        status: {
          bsonType: "string",
          enum: ["UNSET", "OK", "ERROR"]
        },
        startTime: {
          bsonType: "date",
          description: "When span started"
        },
        endTime: {
          bsonType: "date",
          description: "When span ended"
        },
        durationMs: {
          bsonType: "int"
        },
        attributes: {
          bsonType: "object",
          description: "Span attributes (userId, endpoint, errorCode, etc.)"
        },
        events: {
          bsonType: "array",
          description: "Events within span",
          items: {
            bsonType: "object",
            properties: {
              name: { bsonType: "string" },
              timestamp: { bsonType: "date" },
              attributes: { bsonType: "object" }
            }
          }
        }
      }
    }
  }
})

db.traces.createIndex({ traceId: 1 })                    // Query full trace
db.traces.createIndex({ serviceId: 1, timestamp: -1 })   // Service traces
db.traces.createIndex({ startTime: -1 })                 // Recent traces
db.traces.createIndex({ durationMs: -1 })                // Slow traces
```

**Sample Trace Tree:**

```json
{
  "traceId": "550e8400-e29b-41d4-a716-446655440000",
  "spans": [
    {
      "_id": ObjectId("..."),
      "traceId": "550e8400-e29b-41d4-a716-446655440000",
      "spanId": "span-001",
      "parentSpanId": null,
      "serviceId": "frontend-interceptor",
      "operationName": "User Query",
      "status": "OK",
      "startTime": ISODate("2025-02-02T14:32:00.000Z"),
      "endTime": ISODate("2025-02-02T14:32:05.450Z"),
      "durationMs": 5450,
      "attributes": {
        "userId": "user-123",
        "queryText": "What is checks and balances?",
        "source": "browser"
      },
      "events": []
    },
    {
      "_id": ObjectId("..."),
      "traceId": "550e8400-e29b-41d4-a716-446655440000",
      "spanId": "span-002",
      "parentSpanId": "span-001",
      "serviceId": "api-controller",
      "operationName": "POST /api/query",
      "status": "OK",
      "startTime": ISODate("2025-02-02T14:32:00.100Z"),
      "endTime": ISODate("2025-02-02T14:32:04.200Z"),
      "durationMs": 4100,
      "attributes": {
        "httpStatus": 200,
        "endpoint": "/api/query",
        "requestId": "req-456"
      }
    },
    {
      "_id": ObjectId("..."),
      "traceId": "550e8400-e29b-41d4-a716-446655440000",
      "spanId": "span-003",
      "parentSpanId": "span-002",
      "serviceId": "ollama-inference",
      "operationName": "LLM Inference",
      "status": "OK",
      "startTime": ISODate("2025-02-02T14:32:00.500Z"),
      "endTime": ISODate("2025-02-02T14:32:03.700Z"),
      "durationMs": 3200,
      "attributes": {
        "model": "llama2:7b",
        "tokenCount": 256,
        "temperature": 0.7
      }
    }
  ]
}
```

---

### 4. Chat History Collection

**Purpose:** Store conversation records for replay and audit

```typescript
db.createCollection("chat_history", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["conversationId", "userId", "messages", "createdAt"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        conversationId: {
          bsonType: "string",
          description: "Unique conversation identifier"
        },
        userId: {
          bsonType: "string",
          description: "User ID"
        },
        messages: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              messageId: { bsonType: "string" },
              role: { bsonType: "string", enum: ["user", "assistant"] },
              content: { bsonType: "string" },
              traceId: { bsonType: "string" },
              timestamp: { bsonType: "date" },
              metadata: { bsonType: "object" }
            }
          }
        },
        metadata: {
          bsonType: "object",
          properties: {
            sessionId: { bsonType: "string" },
            ipAddress: { bsonType: "string" },
            userAgent: { bsonType: "string" },
            topic: { bsonType: "string" },
            tagsApplied: {
              bsonType: "array",
              items: { bsonType: "string" }
            }
          }
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
})

db.chat_history.createIndex({ conversationId: 1 })
db.chat_history.createIndex({ userId: 1, createdAt: -1 })
db.chat_history.createIndex({ "messages.traceId": 1 })
```

---

### 5. Seed Data Collection (Reference)

**Purpose:** Store reference seed data for seeding operations

```typescript
db.createCollection("seed_data", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["dataType", "mode"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        dataType: {
          bsonType: "string",
          enum: [
            "civic_prompts",
            "error_scenarios",
            "performance_baselines",
            "test_users"
          ]
        },
        mode: {
          bsonType: "string",
          enum: ["minimal", "demo"],
          description: "Seeding mode"
        },
        data: {
          bsonType: "object",
          description: "Actual seed data"
        },
        version: {
          bsonType: "string"
        },
        createdAt: {
          bsonType: "date"
        }
      }
    }
  }
})
```

---

## 🔧 Connection Configuration

### NestJS MongoDB Setup

```typescript
// src/mongo/mongo.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/patriotchat-dev',
        connectionFactory: (connection) => {
          if (process.env.NODE_ENV === 'development') {
            connection.on('connected', () => {
              console.log('✓ MongoDB Connected');
            });
            connection.on('error', (err) => {
              console.error('✗ MongoDB Error:', err);
            });
          }
          return connection;
        },
        maxPoolSize: process.env.NODE_ENV === 'development' ? 10 : 50,
        minPoolSize: 5,
        retryWrites: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      })
    })
  ],
  exports: [MongooseModule]
})
export class MongoModule {}
```

### Environment Configuration

```bash
# .env.development
MONGODB_URI=mongodb://localhost:27017/patriotchat-dev

# .env.production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/patriotchat
MONGODB_POOL_SIZE=50
MONGODB_TIMEOUT=45000
```

---

## 📊 Indexing Strategy

### Query Patterns & Indexes

```typescript
// Pattern 1: Find logs by traceId and time range
// Used: LogService.queryLogs({ traceId })
db.logs.createIndex({ traceId: 1, timestamp: -1 })

// Pattern 2: Find logs by service and severity
// Used: LogService.queryLogs({ serviceId, severity })
db.logs.createIndex({ serviceId: 1, severity: 1, timestamp: -1 })

// Pattern 3: Recent logs
// Used: LogService.getRecentLogs()
db.logs.createIndex({ timestamp: -1 })

// Pattern 4: Logs by severity for alerts
// Used: LogService.getErrorLogs()
db.logs.createIndex({ severity: 1 })

// Pattern 5: Query metrics by service and type
// Used: MetricsService.query({ serviceId, metricType })
db.metrics.createIndex({ serviceId: 1, metricType: 1, timestamp: -1 })

// Pattern 6: Recent metrics
// Used: MetricsService.getRecent()
db.metrics.createIndex({ timestamp: -1 })

// Pattern 7: Full trace retrieval
// Used: TraceService.getTrace({ traceId })
db.traces.createIndex({ traceId: 1 })

// Pattern 8: Service traces
// Used: TraceService.getServiceTraces({ serviceId })
db.traces.createIndex({ serviceId: 1, timestamp: -1 })

// Pattern 9: Slow traces (performance analysis)
// Used: MetricsService.getSlowTraces()
db.traces.createIndex({ durationMs: -1 })
```

### Index Maintenance

```typescript
// Check index sizes
db.logs.aggregate([
  { $indexStats: {} }
])

// Drop unused indexes
db.logs.dropIndex("serviceId_1")

// Rebuild indexes (maintenance)
db.logs.reIndex()

// Get index info
db.logs.getIndexes()
```

---

## 🔄 Data Lifecycle

### Development

**Storage:**

- Location: Local MongoDB on port 27017
- Retention: Keep all logs indefinitely (dev environment)
- Cleanup: Manual via scripts only

**Queries:**

- Plaintext: Logs stored as-is (not encrypted)
- No authentication required
- Full access for debugging

### Production

**Storage:**

- Location: Managed MongoDB cluster
- Retention: Keep logs for 90 days, then archive
- Cleanup: Automatic TTL indexes

**Encryption:**

- At-rest: Enable MongoDB encryption at rest
- In-transit: Use TLS 1.2+
- Credentials: Stored in environment variables

**Access Control:**

- Authentication: SCRAM-SHA-256
- Authorization: Role-based (read, write, admin)
- Audit: Enable MongoDB audit logging

---

## ⚙️ Configuration Files

### docker-compose.yml (Optional MongoDB Service)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
      - ./scripts/init-mongodb.js:/docker-entrypoint-initdb.d/init.js
    networks:
      - patriotchat
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh localhost:27017/test --quiet
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  mongodb_data:

networks:
  patriotchat:
    driver: bridge
```

### MongoDB Initialization Script

```javascript
// scripts/init-mongodb.js
db.createCollection("logs", { /* validation schema */ });
db.createCollection("metrics", { /* validation schema */ });
db.createCollection("traces", { /* validation schema */ });
db.createCollection("chat_history", { /* validation schema */ });

// Create indexes
db.logs.createIndex({ traceId: 1, timestamp: -1 });
db.logs.createIndex({ serviceId: 1, severity: 1, timestamp: -1 });
db.metrics.createIndex({ serviceId: 1, metricType: 1, timestamp: -1 });
db.traces.createIndex({ traceId: 1 });

console.log("✓ MongoDB initialized with collections and indexes");
```

---

## 🧪 Connection Health Check

```typescript
// scripts/check-mongo.ts
import mongoose from 'mongoose';

async function checkMongo() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/patriotchat-dev';
    
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    
    const adminDb = connection.connection.getClient().db('admin');
    const serverStatus = await adminDb.admin().ping();
    
    console.log('✓ MongoDB Connection Successful');
    console.log(`  URI: ${uri}`);
    console.log(`  Status: ${serverStatus.ok === 1 ? 'OK' : 'ERROR'}`);
    
    // Check collections
    const collections = await connection.connection.getClient()
      .db('patriotchat-dev')
      .listCollections()
      .toArray();
    
    console.log(`  Collections: ${collections.map(c => c.name).join(', ')}`);
    
    // Check indexes
    const logIndexes = await connection.connection.getClient()
      .db('patriotchat-dev')
      .collection('logs')
      .getIndexes();
    
    console.log(`  Log indexes: ${Object.keys(logIndexes).length}`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('✗ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
}

checkMongo();
```

---

## 🛡️ Backup & Recovery

### Backup Strategy

```bash
# Full backup
mongodump --uri="mongodb://localhost:27017/patriotchat-dev" \
  --out=/backups/patriotchat-$(date +%Y%m%d-%H%M%S)

# Restore from backup
mongorestore --uri="mongodb://localhost:27017/patriotchat-dev" \
  /backups/patriotchat-20250202-143215

# Export collection to JSON
mongoexport --uri="mongodb://localhost:27017/patriotchat-dev" \
  --collection=logs \
  --out=/exports/logs-$(date +%Y%m%d).json

# Import from JSON
mongoimport --uri="mongodb://localhost:27017/patriotchat-dev" \
  --collection=logs \
  --file=/exports/logs-20250202.json
```

---

## ✅ Setup Checklist

- [ ] MongoDB installed or Docker container ready
- [ ] Collections created with validators
- [ ] Indexes created for all query patterns
- [ ] Connection string configured in environment
- [ ] NestJS MongooseModule setup complete
- [ ] Health check script working
- [ ] Backup strategy documented
- [ ] Development vs production configs separate
- [ ] Encryption configured (production only)
- [ ] TTL policies configured (production only)

---

**Next Steps:**

1. Run MongoDB locally (Docker or native)
2. Execute init script to create collections
3. Test connection with health check script
4. Seed initial data (via SEEDING.md)
5. Monitor logs/metrics/traces in logger UI
