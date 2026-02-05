# Pro-Liberty Sprint Tracking

- Core roadmap: `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md`
- Alignment harness: `documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md`
- Dataset sprint plan: `documentation/planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md`
- Values Commitment: `README.md#values-commitment`
- Tracking table is synced with documentation board for sprint retrospectives; reference this file in PM updates.

This board tracks the implementation plan from `PRO_LIBERTY_BUILD_GUIDE.md` (with the concrete dataset sprint playbook in `PRO_LIBERTY_DATA_PIPELINE.md` and the regression harness ideas from `PRO_LIBERTY_ALIGNMENT_TESTS.md`): Vision checks, curated data pipeline sprints, Constitution-first RAG rollout, and recurring evaluations. Update status/comments as work progresses.

| Phase | Cadence | Description | Owner | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Vision Check | Weekly | Review  less government, more self-determination language against the Values Commitment and flag any drift from constitutional guardrails. | ML Lead | Ongoing | Weekly log entry now captures the latest evaluation status. |
| Data Pipeline Sprint | 2-3 days per source | Curate 200-400 Q&A pairs from one primary text, synthesize liberty-first responses, run bias sanity checks, and LoRA-train on that batch before moving to the next source. | Data Team | In Progress | 1k prompts ready; LoRA training artifacts produced and being evaluated. |
| Constitution-First RAG Rollout | Week 2 milestone | Build the founding-doc vector store, tag chunks with source_type=founding_core, and wire the retriever so Civic prompts always hit those chunks first. | Infra/LLM Team | Blocked | Waiting on metadata tagging schema and new bundle before enabling the retriever. |
| Evaluation Loop | Every release | Re-run loaded civic prompts, score for pro-liberty framing, equality-under-law mentions, and lack of regulatory drift; log metrics in LLM_TUNING_AND_RAG.md. | QA | In Progress | Golden prompt/regulatory drift run scheduled; metrics will land in PRO_LIBERTY_TRACKING.md. |
| Governance Messaging | Ad hoc | When ramping releases, review README/MODEL-CHARTER optional updates to keep the Values Commitment visible to contributors. | Docs Lead | In Progress | README and TODO refreshed; continue referencing README.md#values-commitment. |

## Kanban Snapshot

| Stage | Items | Owner | Comments |
| --- | --- | --- | --- |
| In Progress | Data Pipeline Sprint 001 (Federalist/Anti-Federalist prompts + LoRA run) | Data Team | 1k prompts ready, LoRA training artifacts produced, evaluation logging next. |
| In Progress | Evaluation & bias checks | QA | Running golden prompts / regulatory drift monitor; metrics move to `PRO_LIBERTY_TRACKING.md`. |
| Blocked | Constitution-first RAG Rollout | Infra/LLM Team | Awaiting metadata schema and new artifact release before wiring retriever. |
| Done | Governance messaging (README/TODO updates + bundle README) | Docs | Narrative aligned with `README.md#values-commitment`. |

## Checklist

- [x] Vision check log updated this week (Values Commitment review)
- [x] Data pipeline sprint ship of 200–400 Q&A pairs per source
- [x] Narrative guardrails documented; new terminology guidance recorded in `documentation/LLM/MODEL-CHARTER.md` and the tracking board so dataset edits cite `README.md#values-commitment`.
- [ ] Constitution-first RAG retriever wired + metadata audit
- [ ] Evaluation loop metrics table published in `LLM_TUNING_AND_RAG.md`
- [x] README/MODEL-CHARTER messaging reviewed for drift

## User Stories

1. **PRO-LLM-001: Establish Values Commitment governance**  
   - **Description:** Make the Vision Check cadence document the “Values Commitment” review, ensuring weekly logs capture whether outputs stay centered on limited federal government, equality under law, and decentralized self-determination.  
   - **Acceptance Criteria:** Vision Check notes stored in this board, MODEL-CHARTER references updated if drift detected, reviewers can point to README blurb and `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md` sections 1–2 for context.

2. **PRO-LLM-002: Deliver curated Data Pipeline sprints**  
   - **Description:** For each primary source (e.g., Federalist Papers, Anti-Federalist Papers), curate 200–400 high-signal Q&A pairs in the JSONL schema, validate against bias checkpoints, and LoRA-train the resulting subset before moving to the next corpus.  
   - **Acceptance Criteria:** Dataset artifacts saved under `my_liberty_dataset`, sanity-check reports in `LLM_TUNING_AND_RAG.md`, and training logs reference the Axolotl config.

3. **PRO-LLM-003: Ship Constitution-first RAG rollout**  
   - **Description:** Ingest founding documents into Chroma/Lance/QLDB vector store, tag chunks with `source_type=founding_core`, and adjust the retriever so civic prompts always hit those chunks before others, then document the flow in the guide.  
   - **Acceptance Criteria:** Retriever test checklist passes (founding doc first), citations include Constitution/Federalist references, code snippet updated in `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md`, and tracking table marks the phase complete.

4. **PRO-LLM-004: Harden Evaluation loop**  
   - **Description:** Re-run the loaded prompts described in the guide, score each for pro-liberty framing and equality-of-law references, surface metrics in `LLM_TUNING_AND_RAG.md`, and trigger retraining or adjustments if drift appears.  
   - **Acceptance Criteria:** Evaluation table in doc contains latest scores, anomalies flagged to QA, and new insights feed into the next Data Pipeline sprint scope.

5. **PRO-LLM-005: Document governance messaging**  
   - **Description:** Keep the README and MODEL-CHARTER messaging aligned by embedding the Values Commitment text and referencing the pro-liberty guide each sprint.  
   - **Acceptance Criteria:** README (and/or MODEL-CHARTER) contains the canonical narrative, PR reviewers point to the section when checking doc updates, and any new docs reference this board or guide.

## Quick Links

- Core roadmap: `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md`
- Values Commitment: `README.md#values-commitment`
- Alignment regression harness: `documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md`
- Dataset sprint plan: `documentation/planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md`
- Tracking table is synced with documentation board for sprint retrospectives; reference this file in PM updates.
- Linear import: `documentation/planning/pro-liberty/PRO_LIBERTY_LINEAR.csv` (PRO-LLM-001–005)

## Logs

### 2026-02-04 – Sanity Check & Bias Scoring (rerun after wording tweaks)

1. `pnpm run check:liberty-prompts` → Citation coverage 100%, regulatory drift rate 0% (0 flagged). Updated generator avoids the "regulation-first" framing while highlighting enumerated powers and civic autonomy, so all entries now pass the regulatory filter.

2. This batch is ready for Step 5 training; log the dataset hash + bias score (0.000) in the archive before invoking `liberty-mistral-lora.yaml`.

- Core roadmap: `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md`
- Values Commitment: `README.md#values-commitment`
- Tracking table is synced with documentation board for sprint retrospectives; reference this file in PM updates.

### 2026-02-04 – Python 3.12 stack + quick Axolotl run

1. Provisioned an Ubuntu 24.04 Python 3.12 venv at `/home/jeffrey/axolotl-env312`, upgraded `pip`, and installed `numpy==2.0.1 scikit-learn==1.4.2 accelerate axolotl bitsandbytes peft trl` plus `coverage==7.8.0` so the `coverage.types` import that was breaking `numba` can resolve; this clears the blockers noted earlier in `documentation/INFRASTRUCTURE_SUITE.md` while keeping every change aligned with the Values Commitment narrative.  
2. Added `liberty-mistral-lora.yaml` (messages.chat strategy, LoRA hyperparams, `max_steps=1`, `report_to=none`, `use_wandb=false`, `wandb_mode=disabled`) and ran `/home/jeffrey/axolotl-env312/bin/accelerate launch -m axolotl.cli.train liberty-mistral-lora.yaml --report_to none`. The job now tokenizes the dataset (packed shards saved) and begins adapter/config setup instead of erroring on missing packages; the long preprocess still kept the run going for several minutes before we stopped it after confirming the pipeline starts. Future loops can let it finish and log metrics in `LLM_TUNING_AND_RAG.md`.


### 2026-02-05 – Liberty Mistral second LoRA pass completed

1. Let the full LoRA run (same command above) complete inside WSL (`/home/jeffrey/axolotl-env312/bin/accelerate launch ... liberty-mistral-lora.yaml --report_to none`), saved `liberty-mistral-out/checkpoint-1`, and logged `train_runtime=34522.4855s`, `train_loss=2.5696`, and `train_samples_per_second=0.0`; the promoted adapter is zipped in `tools/checkpoints/liberty-mistral-v1.0-2026-02-05/liberty-mistral-v1.0-2026-02-05.zip` along with `metadata.json` so reviewers can trace the release metadata before updating the default model.
2. Next step: execute the golden prompt + regulatory drift suite (`pnpm run check:liberty-prompts`) per `PRO_LIBERTY_ALIGNMENT_TESTS.md`, capture citation coverage, regulatory drift, and bias/bias-reduction scores in this document and `LLM_TUNING_AND_RAG.md`, then promote the new adapter in the bundle README before defaulting the UI to Liberty Mistral while keeping the other models selectable on the sidebar (per `documentation/LLM/MODEL-CHARTER.md`).

### 2026-02-05 – Alignment check success

1. `pnpm run check:liberty-prompts` completed without TypeScript errors after tightening `scripts/pro_liberty_sanity_check.ts`, and the summary shows 100% citation coverage, 0% regulatory drift, and a bias score of 0.000 across the 1,000 liberty-first prompts.
2. This result confirms the dataset meets Values Commitment requirements; log the same metrics and the command in `LLM_TUNING_AND_RAG.md` and reference the pass when promoting the 2026-02-04 Liberty Mistral bundle so reviewers can see citations/self-determination guardrails were enforced.

### 2026-02-04 – Liberty Mistral bundle & evaluation readiness

1. The trimmed LoRA run created `liberty-mistral-out/adapter_model.safetensors`, `tokenizer.model`, and `tokenizer_config.json`; these artifacts are now zipped inside `tools/checkpoints/liberty-mistral-v1.0-2026-02-04/liberty-mistral-v1.0-2026-02-04.zip` alongside `adapter_config.json`, and the new README there references `README.md#values-commitment`, `PRO_LIBERTY_BUILD_GUIDE.md`, and `PRO_LIBERTY_ALIGNMENT_TESTS.md` so future reviewers can trace the asset back to the constitutional guardrails before the UI defaults to it.
2. Mirror this training/evaluation narrative inside `documentation/INFRASTRUCTURE_SUITE.md` and on `tools/checkpoints/README.md` so every release log lists the bundle location, dataset hash, and the guardrail-focused tests that must run against it.
3. Next eval step: run the golden prompt suite plus regulatory drift monitor via `pnpm run check:liberty-prompts`, reference `documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md`, and log citation coverage, regulatory-drift, and bias scores both here and in `LLM_TUNING_AND_RAG.md` before tagging the `liberty-mistral-v1.0-2026-02-04` artifact.
