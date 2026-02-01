# LLM Architecture Overview

This document describes the high-level architecture for the CEA LLM system. For visual diagrams, use tools like draw.io or Lucidchart based on this description.

## System Components

### Data Layer

- **Sources**: Primary civic/legal texts (e.g., Constitution, court opinions).
- **Processing**: Curation scripts (Go/TS) to clean and format into JSONL.
- **Storage**: Local files or database for datasets.

### Training Layer

- **Framework**: LoRA fine-tuning on base model (e.g., Mistral-7B).
- **Tools**: Python scripts for training, evaluation harness.
- **Output**: Quantized GGUF model files.

### Inference Layer

- **Backend**: PatriotChat Go service loads model, handles requests.
- **API**: NestJS endpoints for chat, with DTO validation.
- **Guardrails**: Keyword filters, charter enforcement.

### Frontend Layer

- **UI**: Angular app for user interaction, displays responses.
- **Integration**: WebSocket for real-time updates.

### Monitoring Layer

- **Telemetry**: Logs requests, latency, guardrail hits.
- **Evaluation**: Automated tests for bias and accuracy.

## Data Flow

1. Data sources → Curation → JSONL dataset.
2. Dataset → Training → Model.
3. User query → API → Model inference → Guardrails → Response → UI.

## Deployment

- Local: Ollama + Docker for self-hosted.
- Cloud: Optional for scaling, but prioritize local-first.

## Security

- Encrypt sensitive data.
- Audit logs for compliance.

## Scalability

- Start local, scale with distributed training if needed.
