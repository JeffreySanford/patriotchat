# Checkpoints & Model Metadata

This directory documents the expected metadata format for model checkpoints created during fine-tuning and experiment runs. Tools that write checkpoints should include a JSON metadata file with the following fields:

- `modelName` (string) — descriptive model name
- `version` (string) — semantic version or timestamp-based version
- `datasetHash` (string) — SHA256 hash (hex) of the dataset or dataset index used
- `loss` (number) — final training loss metric
- `timestamp` (string) — ISO 8601 timestamp of the checkpoint creation
- `commit` (string) — commit SHA of the code used to create the checkpoint

Example
```json
{
  "modelName": "patriotchat-llama2-finetuned",
  "version": "2026-01-31-001",
  "datasetHash": "e3b0c44298fc1c149afbf4c8996fb924...",
  "loss": 0.0123,
  "timestamp": "2026-01-31T20:00:00Z",
  "commit": "abcdef1234567890"
}
```

Recommendations
- Store the metadata alongside the artifact in `tools/checkpoints` and reference it from the governance log when releasing a model.
- Include guardrail tags (e.g., `patriotism, civics`) in checkpoint metadata when relevant.