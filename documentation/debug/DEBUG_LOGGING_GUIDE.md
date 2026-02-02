# PatriotChat - Debug Logging Implementation Guide

## Overview

This document describes the debugging enhancements added to trace the full lifecycle of LLM queries and websocket communication between the frontend and backend services.

## Problem Statement

The frontend query was not returning progress metrics, and websocket communications were not properly delivering health metrics from the API gateway. This guide helps identify where communication breakdowns occur.

## Debug Logging Architecture

### 1. Frontend Query Service (`frontend/src/app/services/llm-query.service.ts`)

**Purpose:** Trace HTTP request/response lifecycle for LLM queries

**Console Logs Added:**

```text
[LlmQueryService] Sending query: { prompt, baseUrl }
[LlmQueryService] Query response received: { response, latencyMs }
[LlmQueryService] ⚠️ No latencyMs in response! Progress metric missing.
[LlmQueryService] Query failed: { error details }
```

**What to Look For:**

- Verify query is sent to correct endpoint (should be `http://localhost:3000/api/query`)
- Check if `latencyMs` is present in response (this is the progress metric)
- Watch for network errors or timeouts

---

### 2. Backend Query Handler (`api/src/app/app.service.ts`)

**Purpose:** Track telemetry stage recording and response building

**Console Logs Added:**

```text
[AppService.executeQuery] Starting query: { prompt }
[AppService.executeQuery] Telemetry stages recorded: frontToApi=processing, apiToGo=processing, goToLlm=processing
[AppService.executeQuery] Calling heavy service at: http://localhost:4000/llm
[AppService.executeQuery] Heavy service responded: { status, heavyLatency, apiToGoLatency, frontToApiLatency, payload }
[AppService.executeQuery] Telemetry stages updated to success state
[AppService.executeQuery] Returning result: { response, latencyMs }
[AppService.executeQuery] ❌ Query failed: { error, prompt, latencies }
```

**What to Look For:**

- All three stages should transition from idle → processing → success
- `heavyLatency` should have a numeric value (latency from Go service)
- Each latency measurement should be > 0
- Confirm the response includes `latencyMs` before being sent

---

### 3. Frontend WebSocket Service (`frontend/src/app/services/pipeline-telemetry.service.ts`)

**Purpose:** Track socket.io connection lifecycle and message reception

**Console Logs Added:**

```text
[PipelineTelemetryService] Connecting to socket.io at: http://localhost:3000
[PipelineTelemetryService] ✅ Socket.io connected: { socket-id }
[PipelineTelemetryService] ⚠️ Socket.io disconnected: { reason }
[PipelineTelemetryService] ❌ Socket.io connection error: { error }
[PipelineTelemetryService] 📨 Received stage update: { stage, state, latencyMs }
[PipelineTelemetryService] ❌ Socket.io error event: { error }
[PipelineTelemetryService] Merging stage update: { update object }
[PipelineTelemetryService] Merged stages: { array of all stages }
```

**What to Look For:**

- Should see "✅ Socket.io connected" message shortly after page load
- When a query is made, should see multiple "📨 Received stage update" messages
- Each update should have valid stage name, state, and latencyMs
- No "❌ Socket.io error" or disconnection messages during query

---

### 4. Backend WebSocket Gateway (`api/src/app/telemetry.gateway.ts`)

**Purpose:** Monitor server-side socket emissions and client management

**Console Logs Added:**

```text
[TelemetryGateway] 🚀 Socket.io server initialized
[TelemetryGateway] Connected clients count: { number }
[TelemetryGateway] 📤 Emitting stage update to all clients: { stage, state, latencyMs, clientsCount }
[TelemetryGateway] ✅ Client connected: { socketId, totalClients, remoteAddress }
[TelemetryGateway] Sending initial stages to new client: { socketId, stageCount, stages array }
[TelemetryGateway] Emitting initial stage to client: { socketId, stage, state }
[TelemetryGateway] ⚠️ Client disconnected: { socketId, reason, remainingClients }
```

**What to Look For:**

- "🚀 Socket.io server initialized" should appear in backend logs
- Should see "✅ Client connected" when you load the frontend
- `clientsCount` should increase by 1 when frontend connects
- When query is executed, should see "📤 Emitting stage update to all clients"
- Stage updates should include all three pipeline stages: `frontToApi`, `apiToGo`, `goToLlm`

---

## Query Lifecycle Trace

### Expected Log Sequence for a Successful Query

**Frontend (Browser Console):**

```text
[LlmQueryService] Sending query: { prompt: "...", baseUrl: "http://localhost:3000/api" }
```

**Backend (Node.js/NestJS Console):**

```text
[AppService.executeQuery] Starting query: { prompt: "..." }
[AppService.executeQuery] Telemetry stages recorded: frontToApi=processing, apiToGo=processing, goToLlm=processing
[AppService.executeQuery] Calling heavy service at: http://localhost:4000/llm
[AppService.executeQuery] Heavy service responded: { status: 200, heavyLatency: 125, apiToGoLatency: 145, frontToApiLatency: 165, payload: {...} }
[AppService.executeQuery] Telemetry stages updated to success state
[AppService.executeQuery] Returning result: { response: "...", latencyMs: 125 }
```

**Backend (WebSocket Gateway Console):**

```text
[TelemetryGateway] 📤 Emitting stage update to all clients: { stage: "frontToApi", state: "processing", latencyMs: null, clientsCount: 1 }
[TelemetryGateway] 📤 Emitting stage update to all clients: { stage: "apiToGo", state: "processing", latencyMs: null, clientsCount: 1 }
[TelemetryGateway] 📤 Emitting stage update to all clients: { stage: "goToLlm", state: "processing", latencyMs: null, clientsCount: 1 }
[TelemetryGateway] 📤 Emitting stage update to all clients: { stage: "goToLlm", state: "success", latencyMs: 125, clientsCount: 1 }
[TelemetryGateway] 📤 Emitting stage update to all clients: { stage: "apiToGo", state: "success", latencyMs: 145, clientsCount: 1 }
[TelemetryGateway] 📤 Emitting stage update to all clients: { stage: "frontToApi", state: "success", latencyMs: 165, clientsCount: 1 }
```

**Frontend (Browser Console):**

```text
[LlmQueryService] Query response received: { response: "...", latencyMs: 125 }
[PipelineTelemetryService] 📨 Received stage update: { stage: "frontToApi", state: "processing", latencyMs: null, updatedAt: "2026-02-02T..." }
[PipelineTelemetryService] Merging stage update: { stage: "frontToApi", state: "processing", ... }
[PipelineTelemetryService] Merged stages: [ { stage: "frontToApi", state: "processing" }, { stage: "apiToGo", state: "idle" }, { stage: "goToLlm", state: "idle" } ]
[PipelineTelemetryService] 📨 Received stage update: { stage: "apiToGo", state: "processing", latencyMs: null, ... }
[PipelineTelemetryService] Merging stage update: { ... }
[PipelineTelemetryService] 📨 Received stage update: { stage: "goToLlm", state: "processing", latencyMs: null, ... }
[PipelineTelemetryService] 📨 Received stage update: { stage: "goToLlm", state: "success", latencyMs: 125, ... }
[PipelineTelemetryService] 📨 Received stage update: { stage: "apiToGo", state: "success", latencyMs: 145, ... }
[PipelineTelemetryService] 📨 Received stage update: { stage: "frontToApi", state: "success", latencyMs: 165, ... }
```

---

## Troubleshooting Guide

### Issue: No WebSocket Connection

**Symptoms:** Frontend shows "❌ Socket.io connection error" or "⚠️ Socket.io disconnected"
**Solution:**

- Verify backend is running on port 3000
- Check if API is configured with WebSocket support
- Review CORS settings in `api/src/main.ts`

### Issue: No Progress Metrics in Response

**Symptoms:** `[LlmQueryService] ⚠️ No latencyMs in response! Progress metric missing.`
**Solution:**

- Check backend is recording `latencyMs` before returning
- Verify heavy service (Go) is responding with timing headers
- Trace the query through `app.service.ts` logs

### Issue: Stages Not Updating in UI

**Symptoms:** Frontend receives stage updates but UI doesn't reflect them
**Solution:**

- Verify `PipelineStageUpdate` type matches in both frontend and backend
- Check that `PIPELINE_STAGE_ORDER` includes all three stages: `frontToApi`, `apiToGo`, `goToLlm`
- Ensure RxJS subscription is properly bound in component

### Issue: Empty Client Count

**Symptoms:** `[TelemetryGateway] clientsCount: 0` when frontend is loaded
**Solution:**

- Verify frontend socket connection is being established
- Check browser console for WebSocket connection errors
- Review socket.io configuration in both frontend and backend

---

## Removing Debug Logging

Once debugging is complete, remove console.log statements using search/replace:

**Files to clean:**

- `frontend/src/app/services/llm-query.service.ts`
- `frontend/src/app/services/pipeline-telemetry.service.ts`
- `api/src/app/app.service.ts`
- `api/src/app/telemetry.gateway.ts`

**Also remember to remove the RxJS operator imports** from llm-query.service.ts if not used elsewhere.

---

## Related Files

- [API Main Entry](api/src/main.ts)
- [Frontend App Module](frontend/src/app/app-module.ts)
- [Shared Types](libs/shared/src/lib/telemetry.ts)
- [Coding Standards](documentation/CODING-STANDARDS.md) - Real-Time Communication Standards section
