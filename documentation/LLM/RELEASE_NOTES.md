# Liberty Mistral v1.0 Release Update

## Promoted Adapter & Guardrail Metrics (2026-02-05)

- Second LoRA pass completed via `/home/jeffrey/axolotl-env312/bin/accelerate launch -m axolotl.cli.train liberty-mistral-lora.yaml --report_to none`; the trained artifacts now live in `tools/checkpoints/liberty-mistral-v1.0-2026-02-05/` alongside `metadata.json` (dataset hash `381ce198707e5232cada9277fcd822931eb21da4ea3056b2cd2775637c7ed01d`, `train_loss=2.5696`, `train_runtime≈34,522s`, commit `f10f12e639ce113109badf224c1c0b6a9051c2d4`).
- `pnpm run check:liberty-prompts` reports 100% citation coverage, 0% regulatory drift, and bias score 0.000 across 1,000 liberty-first prompts; those metrics are documented in `documentation/LLM_TUNING_AND_RAG.md` and `documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md`, which both cite the Values Commitment (`README.md#values-commitment`).
- Import the promoted bundle into Ollama (`ollama create liberty-mistral-v1.0 -f tools/checkpoints/liberty-mistral-v1.0-2026-02-05/Modelfile`) and restart the LLM service (`docker compose restart patriotchat-llm`) so `liberty-mistral-v1.0` resolves to the updated adapter; confirm the API/UI still expose the fallback models and that the sidebar copy continues to mirror the guardrail language in `documentation/LLM/MODEL-CHARTER.md`.
- Reference this release note, the bundle README, and `metadata.json` whenever you promote the bundle or write governance notes so reviewers can trace the liberty-first alignment before hitting production.
