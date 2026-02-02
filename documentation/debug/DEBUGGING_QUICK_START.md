# Quick Start: Debugging PatriotChat Query Issues

## What Was Added

Comprehensive console logging across the entire query pipeline to help identify where communication breaks down between frontend, API, and backend services.

## Files Modified

### 1. Frontend Query Service

📍 `frontend/src/app/services/llm-query.service.ts`

- Logs when query is sent
- Logs response with `latencyMs` metric
- Warns if progress metric is missing
- Captures any network errors

### 2. Backend Query Handler

📍 `api/src/app/app.service.ts`

- Logs query start and end
- Tracks all 3 telemetry stages (frontToApi, apiToGo, goToLlm)
- Logs latency for each stage
- Captures heavy service (Go) calls and responses

### 3. Frontend WebSocket Service

📍 `frontend/src/app/services/pipeline-telemetry.service.ts`

- Logs socket.io connection/disconnection
- Logs connection errors
- Logs when stage updates are received
- Logs stage merging process

### 4. Backend WebSocket Gateway

📍 `api/src/app/telemetry.gateway.ts`

- Logs socket server initialization
- Logs client connections with socket ID
- Logs stage updates being emitted to clients
- Logs client disconnections

### 5. Documentation

📍 `DEBUG_LOGGING_GUIDE.md` (new file)

- Detailed logging trace guide
- Expected log sequences
- Troubleshooting section
- Clean-up instructions

## How to Use

### 1. Start Your Services

```bash
pnpm run start:all
```

This starts:

- Frontend on `:4200`
- API (NestJS) on `:3000`
- Heavy service (Go) on `:4000`

### 2. Open Browser DevTools

- Press `F12` in your browser
- Go to **Console** tab
- Keep this visible while testing

### 3. Make a Query

- Use the frontend to submit a query
- Watch the console for debug logs

### 4. Trace the Path

Look for logs in this order:

**Browser Console (Frontend):**

```text
[LlmQueryService] Sending query...
[LlmQueryService] Query response received...
[PipelineTelemetryService] 📨 Received stage update...
```

**Terminal (Backend API):**

```text
[AppService.executeQuery] Starting query...
[AppService.executeQuery] Telemetry stages recorded...
[AppService.executeQuery] Calling heavy service...
[TelemetryGateway] 📤 Emitting stage update...
```

## Key Metrics to Check

| Metric | Where to Find | Normal Range |
| --- | --- | --- |
| `latencyMs` | Response in browser console | 50-500ms |
| `apiToGoLatency` | Backend console | 100-1000ms |
| `frontToApiLatency` | Backend console | 200-2000ms |
| Client count | `[TelemetryGateway]` logs | 1-10 |
| Connection status | `[PipelineTelemetryService]` | ✅ connected |

## Common Issues

### ❌ "Query failed" in frontend

- Check backend is running
- Verify API URL is correct
- Check browser network tab for 500 errors

### ❌ "No latencyMs in response"

- Go service may be down
- Check backend heavy service endpoint
- Look for `[AppService.executeQuery] ❌ Query failed` in backend logs

### ❌ No stage updates received

- Check socket connection: should see `✅ Socket.io connected`
- Verify `clientsCount > 0` in gateway logs
- Check browser DevTools for WebSocket errors

### ❌ Socket connection error

- Verify API is running on port 3000
- Check frontend can access `http://localhost:3000`
- Review CORS settings in `api/src/main.ts`

## Next Steps

1. **Run the application** with `pnpm run start:all`
2. **Open browser console** (F12)
3. **Submit a query** through the frontend
4. **Check logs** in both browser console and terminal
5. **Compare** with expected logs in `DEBUG_LOGGING_GUIDE.md`
6. **Report** any deviations or errors

## Removing Debug Logs (When Complete)

Once you've identified the issue, remove the `console.log` statements from:

- Frontend services
- Backend services

The logs are clearly marked with `console.log` or `console.warn` prefixed with `[ServiceName]`.

## See Also

- [Full Debug Logging Guide](DEBUG_LOGGING_GUIDE.md)
- [Coding Standards - Socket.IO](documentation/CODING-STANDARDS.md#real-time-communication-standards)
- [API Main Configuration](api/src/main.ts)
- [Shared Types](libs/shared/src/lib/telemetry.ts)
