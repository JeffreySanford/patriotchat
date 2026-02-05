# Liberty Mistral v1.0 (2026-02-05) Deployment Bundle

This folder holds the promoted Liberty Mistral adapter, zipped bundle, and metadata recorded after the second LoRA pass (see `documentation/LLM/LLM-CREATION.md` and `README.md#values-commitment` for context). The companion `metadata.json` (train stats, dataset hash, evaluation outcome) proves the bundle honors the Values Commitment and the pro-liberty alignment tests before defaulting this model for PatriotChat.

## Contents

- `liberty-mistral-v1.0-2026-02-05.zip` — zipped artifacts: `adapter_model.safetensors`, `tokenizer.model`, `tokenizer_config.json`.
- `adapter_config.json` — LoRA configuration for downstream tooling.
- `metadata.json` — training/evaluation summary (dataset hash, loss, runtime, evaluation scores).

## Promotion notes

1. This bundle reflects the full LoRA run (`/home/jeffrey/axolotl-env312/bin/accelerate launch -m axolotl.cli.train liberty-mistral-lora.yaml --report_to none`) that logged `train_loss=2.5696`, `train_runtime≈34,522s`, and evaluation metrics (citation coverage 100%, 0% regulatory drift, bias score 0.000 via `pnpm run check:liberty-prompts`).
2. Update the serving configuration (Ollama host/Go service) to point at this bundle before marking Liberty Mistral as the default while keeping other sidebar models selectable; see `documentation/LLM/MODEL-CHARTER.md` for how to surface the Values Commitment to users and dropdown instructions.
3. Reference `documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md` when mentioning this bundle in PRs or release notes so contributions trace back to the Values Commitment.
