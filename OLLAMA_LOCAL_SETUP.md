# Liberty Mistral Setup - Ollama Only (Simple)

**Status:** Docker-based Ollama with local model files  
**Simplicity:** ✅ Single Docker container approach  
**Model:** Mistral-7B-Instruct-v0.3 + Liberty adapter (already downloaded)

---

## How It Works

1. **Model files already exist** at `C:\Users\Sanford\.ollama\models\mistralai\Mistral-7B-Instruct-v0.3\`
   - 3 weight files (safetensors format)
   - Adapter files for Liberty tuning

2. **Docker Ollama container** accesses them via volume mount in `docker-compose.yml`
   - No registry pull needed
   - Uses local files directly
   - Much faster (no network dependency)

3. **Go service** calls Ollama on port 11434 (existing Docker setup)

---

## Quick Start

```bash
# 1. Make sure you're in the repo root
cd C:\repos\patriotchat

# 2. Start all services including Ollama
pnpm run start:all
# or
docker-compose up -d

# 3. Verify Ollama loaded the model
curl http://localhost:11434/api/tags
# Should show: mistralai/Mistral-7B-Instruct-v0.3 or similar

# 4. Test inference
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "mistral:latest",
    "prompt": "What is liberty?",
    "stream": false
  }'
```

---

## What Changed in docker-compose.yml

**Before:**
```yaml
ollama:
  volumes:
    - ./models:/models    # Local models dir (empty)
```

**Now:**
```yaml
ollama:
  volumes:
    # Mount Windows home directory where models actually are
    - ${USERPROFILE}/.ollama/models:/root/.ollama/models
    - ${USERPROFILE}/.ollama:/root/.ollama
  environment:
    - OLLAMA_MODELS=/root/.ollama/models
```

This tells Docker to use the real model files from Windows instead of looking for an empty local directory.

---

## Model Path

| OS | Location |
|----|----|
| Windows (Host) | `C:\Users\Sanford\.ollama\models\mistralai\Mistral-7B-Instruct-v0.3\` |
| Docker (Container) | `/root/.ollama/models/mistralai/Mistral-7B-Instruct-v0.3/` |

---

## Troubleshooting

**Ollama says "model not found":**
```bash
# 1. Restart Ollama container
docker-compose restart ollama

# 2. Check if files are accessible in container
docker exec patriotchat-ollama ls -lah /root/.ollama/models/mistralai/

# 3. Try pulling the model (will fail gracefully if using local)
docker exec patriotchat-ollama ollama pull mistral
```

**Slow first request:**
- Ollama is loading the 13.7GB model into memory
- First request takes 30-60 seconds
- Subsequent requests are fast (cached)

**Check Ollama status:**
```bash
curl http://localhost:11434/api/tags

# Should return JSON with loaded models
```

---

## No Python Server Needed

✅ Removed the Python service completely  
✅ Using existing Docker/Ollama setup  
✅ Simpler to maintain and deploy  
✅ No WSL virtual environment required  
✅ Your existing architecture still works

---

Generated: 2026-02-05  
Reference: [docker-compose.yml](../../docker-compose.yml)
