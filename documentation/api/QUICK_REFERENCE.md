# API Testing Quick Reference

## 🚀 Quick Start

```bash
# Terminal 1: Build and start API
pnpm run build
pnpm run start:api

# Terminal 2: Run API tests
pnpm run test:api:endpoints
```

## 📋 Available Endpoints

| Method | Endpoint      | Purpose          | Response                                                               |
| ------ | ------------- | ---------------- | ---------------------------------------------------------------------- |
| GET    | `/api`        | Root endpoint    | `{ message: "Hello API" }`                                             |
| GET    | `/api/status` | System status    | `{ revision, uptimeMs, activeModel, guardrailPassRate, indicators[] }` |
| POST   | `/api/query`  | Submit LLM query | `{ response: string, latencyMs?: number }`                             |

## 🧪 Testing Methods

### 1. Node.js Script (Recommended)

```bash
pnpm run test:api:endpoints
# Or: node test-api-endpoints.js
```

### 2. E2E Tests

```bash
pnpm run test:api:e2e
# Or: pnpm nx run api-e2e:e2e
```

### 3. PowerShell (Windows)

```powershell
./test-api-endpoints.ps1
```

### 4. Bash Script (Mac/Linux)

```bash
bash test-api-endpoints.sh
```

### 5. Manual curl

```bash
curl http://localhost:3000/api
curl http://localhost:3000/api/status
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'
```

## 📊 Test Coverage

✅ 20+ test cases  
✅ Functionality tests  
✅ Error handling  
✅ Performance validation  
✅ CORS & Headers compliance  
✅ API contract validation

## 🔧 Environment Variables

```bash
# Custom API URL
API_URL=http://custom-url:3000 pnpm run test:api:endpoints
```

## 📁 Test Files

- `test-api-endpoints.js` - Node.js/cross-platform
- `test-api-endpoints.ps1` - PowerShell for Windows
- `test-api-endpoints.sh` - Bash for Mac/Linux
- `api-e2e/src/api/endpoints.spec.ts` - Jest e2e tests
- `GUIDE.md` - Full documentation
- `ENDPOINTS_SUMMARY.md` - Detailed summary

## 📝 Example curl Commands

```bash
# 1. Test root endpoint
curl -v http://localhost:3000/api

# 2. Test status endpoint with pretty JSON
curl -s http://localhost:3000/api/status | jq .

# 3. Test query endpoint
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is an API?"}' | jq .

# 4. Test query with verbose output
curl -v -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test"}'

# 5. Test error case (missing field)
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{}'

# 6. Test CORS headers
curl -I http://localhost:3000/api

# 7. Test non-existent endpoint
curl -v http://localhost:3000/api/nonexistent
```

## ⚡ Common Issues & Solutions

| Issue               | Solution                                   |
| ------------------- | ------------------------------------------ |
| Connection refused  | `pnpm run start:api` in separate terminal  |
| Port already in use | `lsof -i :3000` then kill the process      |
| CORS errors         | Check allowed origins in `api/src/main.ts` |
| 404 not found       | Verify API is built: `pnpm run build`      |
| Tests timeout       | Increase timeout in test files             |

## 📚 Documentation

- **Full Guide:** See `GUIDE.md`
- **Summary:** See `ENDPOINTS_SUMMARY.md`
- **Architecture:** See `documentation/OVERVIEW.md`

## 🎯 Test Workflow

```text
1. Build
   ↓
2. Start API Server (Terminal 1)
   ↓
3. Run Tests (Terminal 2)
   ↓
4. Review Results
   ↓
5. Fix Issues (if any)
   ↓
6. Re-run Tests
```

## 📞 Support

For issues or questions:

1. Check `GUIDE.md` troubleshooting section
2. Review test output for details
3. Check API logs for backend errors
4. Verify dependencies are running (LLM, heavy service)
