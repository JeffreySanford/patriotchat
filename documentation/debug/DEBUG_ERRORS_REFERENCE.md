# PatriotChat Debug Logging - What Errors to Look For

## Critical Errors & What They Mean

### Frontend (Browser Console)

#### ❌ "[LlmQueryService] Query failed"

**Means:** HTTP request failed
**Check:**

- Is API running? (`pnpm run start:api`)
- Is API endpoint correct in frontend/src/app/services/llm-query.service.ts?
- Browser DevTools → Network tab → Check /api/query request status
- Any CORS errors?

**Next:** Look at backend terminal for corresponding error log

---

#### ❌ "[LlmQueryService] ⚠️ No latencyMs in response! Progress metric missing."

**Means:** API returned response but without the progress metric
**Check:**

- Look at backend logs: `[AppService.executeQuery] Returning result:`
- Is `latencyMs` field in the returned object?
- Did heavy service (Go on :4000) respond with timing headers?
- Check if `heavyLatency` is 0 (Go service may have failed silently)

**Next:** Go service not running or not responding with timing info

---

#### ❌ "[PipelineTelemetryService] ❌ Socket.io connection error"

**Means:** Cannot establish WebSocket connection to API
**Check:**

- Is API running on port 3000? (`pnpm run start:api`)
- Browser Network tab → Filter for "ws" or "socket.io"
- Look for WebSocket connection in Network tab
- Any messages like "ERR_CONNECTION_REFUSED"?

**Next:** Backend WebSocket not initialized or port blocked

---

#### ❌ "[PipelineTelemetryService] ⚠️ Socket.io disconnected"

**Means:** WebSocket was connected but became disconnected
**Check:**

- Did connection error appear first?
- Look at reason message
- Common reasons: "transport close", "server namespace disconnect"
- Check if query was in progress when disconnect happened

**Next:** Backend may have crashed or WebSocket server stopped

---

#### No "[PipelineTelemetryService] 📨 Received stage update" messages

**Means:** WebSocket connected but not receiving stage updates
**Check:**

- Is socket connected? Look for "✅ Socket.io connected"
- Backend logs: Are stages being emitted? Look for `[TelemetryGateway] 📤 Emitting`
- If backend emitting but frontend not receiving: Network tab → WebSocket messages
- Use filter on WebSocket tab to see actual messages

**Next:** Stage updates not being sent from backend or lost in transmission

---

### Backend (Terminal/Node.js Console)

#### ❌ "[AppService.executeQuery] Starting query: {}, but no follow-up logs"

**Means:** Query started but process hung (likely waiting on heavy service)
**Check:**

- Is heavy service running? (`pnpm run start:heavy` or Docker)
- Backend URL in app.service.ts matches actual location
- Check if Go service responds: `curl http://localhost:4000/llm?q=test`
- Network connectivity to heavy service

**Next:** Heavy service (Go) is not running or unreachable

---

#### ❌ "[AppService.executeQuery] ❌ Query failed"

**Means:** Query failed in backend
**Check:**

- Full error message in logs
- Is it a network error to heavy service?
- Is it a parsing error in the response?
- Check Go service logs for what went wrong
- Response format matches expected `{ response: string }`

**Next:** Issue in heavy service or response format

---

#### ⚠️ "[AppService.executeQuery] Heavy service responded" but latencies are very high

**Means:** Query succeeded but performance is degraded
**Check:**

- `heavyLatency` > 1000ms: Go/LLM inference is slow
- `apiToGoLatency` > 2000ms: Network to heavy service is slow
- `frontToApiLatency` > 3000ms: Frontend-to-API round trip is slow
- Normal ranges: 50-500ms for inference, 100-1000ms for network

**Next:** Performance issue, not correctness issue

---

#### No "[TelemetryGateway] 📤 Emitting stage update" messages during query

**Means:** Telemetry system not recording stages
**Check:**

- Backend logs show stages being recorded: `[AppService.executeQuery] Telemetry stages recorded:`
- Is subscription active? Look for errors in afterInit
- Check if PipelineTelemetryService is injected correctly
- Any errors in service initialization?

**Next:** Telemetry service not working

---

#### "[TelemetryGateway] Connected clients count: 0" even after frontend loads

**Means:** No clients are connected to WebSocket
**Check:**

- Frontend logs: Is it connecting? `[PipelineTelemetryService] Connecting to socket.io at:`
- Is connection attempted? Look for "connecting" or "connect" events
- Browser Network tab: WebSocket connection attempted?
- If attempted but failing: What's the error?

**Next:** WebSocket server not accepting connections (CORS, port, etc.)

---

#### "[TelemetryGateway] ⚠️ Client disconnected: reason: transport close"

**Means:** WebSocket connection closed unexpectedly
**Check:**

- Was client actively using the connection?
- Did query just complete?
- Browser might have closed idle connection
- Check if query handler threw an error

**Next:** May be normal if no activity, or error if during query

---

## Order of Checks

When troubleshooting, check in this order:

### Level 1: Services Running

```bash
# Terminal 1 - Frontend
pnpm run start:frontend

# Terminal 2 - API (NestJS)
pnpm run start:api

# Terminal 3 - Heavy Service (Go)
pnpm run start:heavy

# Terminal 4 - Watch logs/run tests
```

Verify:

- ✅ Frontend loads at <http://localhost:4200>
- ✅ API responds to <http://localhost:3000/api> (check browser)
- ✅ All services started without errors

---

### Level 2: HTTP Communication (Query)

```text
Browser: [LlmQueryService] Sending query...
Terminal: [AppService.executeQuery] Starting query...
Terminal: [AppService.executeQuery] Calling heavy service...
Terminal: [AppService.executeQuery] Heavy service responded...
Terminal: [AppService.executeQuery] Returning result...
Browser: [LlmQueryService] Query response received...
```

If this chain is broken:

- Check which step is missing
- Look for ❌ errors at that step
- Use Browser DevTools Network tab

---

### Level 3: WebSocket Communication (Metrics)

```text
Browser: [PipelineTelemetryService] Socket.io connected
Terminal: [TelemetryGateway] Client connected
Terminal: [TelemetryGateway] 📤 Emitting stage update
Browser: [PipelineTelemetryService] 📨 Received stage update
```

If this chain is broken:

- Check which step is missing
- Look for ❌ connection errors
- Verify both HTTP and WebSocket work

---

### Level 4: Performance Check

```text
Terminal: apiToGoLatency: 145
Terminal: frontToApiLatency: 165
Browser: latencyMs: 125
```

Should all be in reasonable ranges (50-500ms for LLM)

---

## Quick Diagnosis Commands

### Test Frontend Query Endpoint

```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello"}'
```

### Test Heavy Service Endpoint

```bash
curl "http://localhost:4000/llm?q=Hello"
```

### Check Ports

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :4000
netstat -ano | findstr :4200

# Mac/Linux
lsof -i :3000
lsof -i :4000
lsof -i :4200
```

---

## Debug Log Checklist

When investigating issues, verify:

### ✅ Checklist for Query Response Issue

- [ ] `[LlmQueryService] Sending query` appears
- [ ] `[AppService.executeQuery] Starting query` appears (timing: <100ms after)
- [ ] `[AppService.executeQuery] Calling heavy service at: http://localhost:4000/llm` appears
- [ ] `[AppService.executeQuery] Heavy service responded` appears with latencies > 0
- [ ] `[LlmQueryService] Query response received` appears with `latencyMs` field
- [ ] `latencyMs` is a positive number, not `null` or `undefined`

### ✅ Checklist for WebSocket Metrics Issue

- [ ] `[PipelineTelemetryService] Connecting to socket.io at:` appears on load
- [ ] `[PipelineTelemetryService] ✅ Socket.io connected` appears (timing: <1s after load)
- [ ] `[TelemetryGateway] ✅ Client connected` appears (backend terminal)
- [ ] `[TelemetryGateway] clientsCount: 1` appears (or higher)
- [ ] When query runs: `[TelemetryGateway] 📤 Emitting stage update` appears multiple times
- [ ] Each emit shows `stage`, `state`, and `latencyMs` fields
- [ ] `[PipelineTelemetryService] 📨 Received stage update` appears in browser (6 messages for complete query)
- [ ] Final stages show `latencyMs` values (not null)

---

## Visual Debug Summary

```text
Query Lifecycle:
┌─────────────┐
│  Frontend   │ [LlmQueryService] Sending query
└──────┬──────┘
       │ HTTP POST /api/query
       ▼
┌─────────────┐
│    API      │ [AppService] Starting query
│ (NestJS)    │ [AppService] Telemetry stages recorded
│             │ [AppService] Calling heavy service
└──────┬──────┘
       │ HTTP GET /llm
       ▼
┌─────────────┐
│    Heavy    │ Returns: { response, headers: x-go-to-llm-latency }
│   Service   │
│    (Go)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    API      │ [AppService] Heavy service responded
│ (NestJS)    │ [AppService] Returning result with latencyMs
│             │ [TelemetryGateway] Emitting stage updates
└──────┬──────┘
       │ JSON response + WebSocket messages
       ▼
┌─────────────┐
│  Frontend   │ [LlmQueryService] Query response received
│             │ [PipelineTelemetry] Received 6 stage updates
└─────────────┘
```

If any stage is missing logs → that's where to investigate.

---

## Still Stuck?

If you've checked all of the above and still have issues:

1. Check for any other errors in the logs (search for "error" or "Error")
2. Check network tab in browser for failed requests
3. Look at service startup output for initialization errors
4. Check if all dependencies are installed: `pnpm install`
5. Try rebuilding: `pnpm run build`
6. Check file paths match documentation
7. Review CORS settings in `api/src/main.ts`
8. Verify environment variables if any are set

See `DEBUG_LOGGING_GUIDE.md` for more detailed troubleshooting.
