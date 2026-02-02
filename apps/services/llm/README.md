# LLM Inference Service

**Port:** 4004  
**Language:** Go 1.21  
**Role:** LLM model inference, context-aware generation, entity analysis

---

## Overview

The LLM Inference Service handles all LLM-related operations:

- Model inference via Ollama
- Context-aware prompt generation
- Entity analysis and summaries
- Policy position inference
- Funding impact analysis

---

## API Endpoints

### Health Check

```bash
GET /health
```

Response: `{"status": "ok", "service": "llm-service", "time": "..."}`

### Ready Check

```bash
GET /ready
```

Response: `{"status": "ready"}` (checks DB and Ollama)

### Generate Inference

```bash
POST /inference/generate
Content-Type: application/json

{
  "prompt": "Analyze this entity...",
  "model": "llama2",
  "context": "Additional context",
  "user_id": "uuid"
}
```

Response: `{"result": "...", "model": "llama2", "tokens": 150, "duration": "1.2s"}`

### List Models

```bash
GET /inference/models
```

Response: `{"models": ["llama2", "mistral", "neural-chat"]}`

---

## Database

Uses PostgreSQL for inference history and logging.

---

## Ollama Integration

Connects to Ollama at `http://patriotchat-ollama:11434` for model inference.

---

## Docker

```bash
docker build -t patriotchat-llm:latest .
docker run -p 4004:4004 -e DB_HOST=postgres patriotchat-llm:latest
```

---

## Testing

```bash
curl http://localhost:4004/health
curl http://localhost:4004/inference/models
```
