# PatriotChat TODO (root)

_Updated 2026-02-04 18:30 UTC - AGILE-informed guardrail tracker - single developer + AI pair workflow - reference README.md#values-commitment when making decisions._

## Current System Status - PRODUCTION READY (+ Liberty Mistral v1.0)

- Liberty Mistral v1.0 pipeline is live: 1,000 liberty-first prompts generated, LoRA artifacts produced, and the Liberty Mistral bundle promoted to tools/checkpoints/liberty-mistral-v1.0-2026-02-05/ (with metadata.json and evaluation notes) referencing the Values Commitment and documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md.
- LLM integration continues to route inference through Ollama -> Inference Go service -> NestJS API -> Angular UI, now defaulting to Liberty Mistral while keeping fallback models selectable via the sidebar.
- Dataset provenance: my_liberty_dataset/train.jsonl aligns with the schema in documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md so enumerated powers, self-determination, and equality under law remain the guiding prior.
- Evaluation pipeline: The golden prompt suite plus regulatory-drift monitor from documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md will score this bundle before any production rollout; all logs go into documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md.

## Sprint Board

- Evaluation and bias checks: `pnpm run check:liberty-prompts` succeeded with 100% citation coverage, 0% regulatory drift, and bias score 0.000; the result is logged in `documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md` so the Values Commitment alignment is auditable and the Golden Prompt suite can be referenced before releasing the next adapter version.
- Model selector UI and API contract: eliminate the `[object Object]` rendering, ensure the sidebar shows the four models with the active router highlighted, and align `api-gateway`/frontend contracts so `LLMModelInfo[]` flows cleanly while keeping the Values Commitment guardrails visible on every selection.
- Deployment bundling docs: keep `tools/checkpoints/liberty-mistral-v1.0-2026-02-05/README.md` (plus metadata.json) and `documentation/INFRASTRUCTURE_SUITE.md` synchronized with `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md` so evaluators can trace the promoted artifact back to the constitutional guardrails before serving it.

### Backlog / Upcoming

- PRO-LLM-003 Constitution-first RAG rollout: ingest founding docs into the vector store, tag with source_type=founding_core, and ensure civic prompts cite the Constitution first (PRO_LIBERTY_BUILD_GUIDE.md, LLM_TUNING_AND_RAG.md).
- Provenance and metadata tracking: unify dataset metadata (hashes, guardrail tags) with tools/checkpoints/README.md expectations and log every new release version via PRO_LIBERTY_TRACKING.md.
- Values profile filters and UI wizards: sync the sidebar, query client, and analytics events so the Liberty-first selection is auditable and alternate models remain visible for fallback queries.
- Governance messaging: keep README/Model Charter messaging aligned, citing README.md#values-commitment and PRO_LIBERTY_BUILD_GUIDE.md whenever a sprint update touches documentation.

### Completed This Sprint (2026-02-04)

- Liberty-first dataset and LoRA run: pnpm run generate:liberty-prompts created the JSONL batch, and /home/jeffrey/axolotl-env312/bin/accelerate launch -m axolotl.cli.train liberty-mistral-lora.yaml --report_to none tokenized it for the adapter bundle.
- Artifact bundle: zipped adapter_model.safetensors and tokenizer assets into tools/checkpoints/liberty-mistral-v1.0-2026-02-05/, synced the bundle README to mention PRO_LIBERTY_BUILD_GUIDE.md, PRO_LIBERTY_ALIGNMENT_TESTS.md, and metadata.json with evaluation notes, and logged the outcome so reviewers can cite the Values Commitment.
- Documentation alignment: README, TODO, and the Pro-Liberty planning docs now reference the same canonical narrative so every doc update traces back to the constitutional guardrails.
- Linear import completed: `documentation/planning/pro-liberty/PRO_LIBERTY_LINEAR.csv` now tracks the PRO-LLM stories (PRO-LLM-002 and PRO-LLM-005 marked done, the rest in progress/blocked) so the sprint board is archived and ready for the next evaluation sprint.

## Agile Notes & Pro-Liberty Principles

- Keep stories small, incremental, and trace every decision to README.md#values-commitment plus the relevant documentation/planning/pro-liberty/* doc (roadmap, data pipeline, alignment tests, tracking board).
- Pair documentation updates (README, TODO, MODEL CHARTER) with code changes; the lone developer + AI workflow relies on these canonical references before approving contributions.
- When training resumes, log dataset hash, batch size, eval metrics, and bias scores inside PRO_LIBERTY_TRACKING.md and the new tools/checkpoints metadata before tagging the artifact.
- Document new sprints in the Linear import (documentation/planning/pro-liberty/PRO_LIBERTY_LINEAR.csv) so PRO-LLM-001...005 stay synchronized.

## Archive

- 2026-02-04 18:00 UTC: Liberty Mistral dataset generation, trimmed LoRA run, and bundle zip completed; evaluation logs move to PRO_LIBERTY_TRACKING.md so the Values Commitment timeline stays auditable.
- 2026-02-03: Full workspace test validation, frontend/API/Go testing, and documentation reorg notes are now part of this archive with details preserved in WORK_COMPLETION_SUMMARY.md.

## Key References

- Status and Values: README.md, README.md#values-commitment
- Sprint tracking: documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md
- Dataset and training guide: documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md
- Evaluation guardrails: documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md
- Artifact bundle: tools/checkpoints/liberty-mistral-v1.0-2026-02-05/README.md
- Governance: documentation/GOVERNANCE.md, CODE_OF_CONDUCT.md
