# CORS & WebSocket Configuration Fix

## Issues Resolved

### 1. CORS Error (HTTP Query Endpoint)

**Error Message:**

```text
Access to XMLHttpRequest at 'http://localhost:3000/api/query' from origin 'http://localhost:4200'
has been blocked by CORS policy: Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Root Cause:**

- CORS was configured with `origin: true` (allow all origins) but wasn't being properly applied
- Needed explicit `ALLOWED_ORIGINS` array to match both frontend dev server addresses

**Solution Applied:**

- Changed [api/src/main.ts](api/src/main.ts#L22) from `origin: true` to `origin: ALLOWED_ORIGINS`
- Updated `ALLOWED_ORIGINS` constant to include all frontend dev server addresses:

```typescript
const ALLOWED_ORIGINS: string[] = [
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:4205',
  'http://127.0.0.1:4205',
];
```

---

### 2. WebSocket 400 Handshake Error

**Error Message:**

```text
WebSocket connection to 'ws://localhost:3000/socket.io/?EIO=4&transport=websocket' failed:
Error during WebSocket handshake: Unexpected response code: 400
```

**Root Cause:**

- WebSocket gateway was using root namespace `/` which conflicted with Socket.io's default routing
- Gateway CORS was set to `origin: true` without explicit origins
- Frontend was connecting to wrong namespace

**Solution Applied:**

#### Backend Changes

1. Updated [api/src/app/telemetry.gateway.ts](api/src/app/telemetry.gateway.ts#L20) to use explicit namespace:

```typescript
@WebSocketGateway({
  namespace: '/telemetry',
  transports: ['websocket', 'polling'],
  cors: {
    origin: TELEMETRY_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
```

1. Added explicit `TELEMETRY_ORIGINS` constant in telemetry.gateway.ts

#### Frontend Changes

1. Updated [frontend/src/app/services/pipeline-telemetry.service.ts](frontend/src/app/services/pipeline-telemetry.service.ts#L28) to connect to correct namespace:

```typescript
const fallbackEndpoint: string = 'http://localhost:3000/telemetry';
this.socket = io(fallbackEndpoint, {
  transports: ['websocket'],
  reconnectionDelay: 2_500,
  reconnectionAttempts: Infinity,
});
```

---

## Configuration Summary

### API Server (api/src/main.ts)

- **HTTP CORS:** Enabled for all `ALLOWED_ORIGINS` with credentials
- **WebSocket Adapter:** Uses NestJS IoAdapter (inherits CORS from gateway decorators)
- **Global Prefix:** `/api` (excluded for socket.io and telemetry routes)
- **Port:** 3000

### WebSocket Gateway (api/src/app/telemetry.gateway.ts)

- **Namespace:** `/telemetry` (allows specific routing separate from HTTP API)
- **Transports:** WebSocket (primary) + Polling (fallback)
- **CORS:** Explicit origin list matching frontend dev server addresses
- **Credentials:** Enabled (required for WebSocket with CORS)

### Frontend Client (frontend/src/app/services/pipeline-telemetry.service.ts)

- **Connection URL:** `http://localhost:3000/telemetry`
- **Transport:** WebSocket (with polling fallback)
- **Reconnection:** 2.5s delay, infinite retries
- **Debug Logging:** Enabled with `[PipelineTelemetryService]` prefix

---

## Testing the Fix

1. **Run the full dev stack:**

   ```bash
   pnpm run start:all
   ```

2. **Check browser console for:**

   ```text
   [LlmQueryService] Sending query to http://localhost:3000/api/query
   [PipelineTelemetryService] Connecting to socket.io at: http://localhost:3000/telemetry
   [PipelineTelemetryService] ✅ Socket.io connected: <socket-id>
   ```

3. **Check browser Network tab for:**

   - ✅ POST `/api/query` with status 200
   - ✅ WebSocket connection to `/socket.io/?EIO=4&transport=websocket` with status 101

4. **Submit a query in frontend:**

   - Should see progress metrics flowing from WebSocket
   - Should see latency metrics in response

---

## Key Files Modified

| File | Change | Lines |
| --- | --- | --- |
