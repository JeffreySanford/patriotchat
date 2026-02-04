# Pro-Liberty Sprint Tracking

- Core roadmap: `documentation/planning/PRO_LIBERTY_BUILD_GUIDE.md`
- Values Commitment: `README.md#values-commitment`
- Tracking table is synced with documentation board for sprint retrospectives; reference this file in PM updates.

This board tracks the implementation plan from `PRO_LIBERTY_BUILD_GUIDE.md`: Vision checks, curated data pipeline sprints, Constitution-first RAG rollout, and recurring evaluations. Update status/comments as work progresses.

| Phase | Cadence | Description | Owner | Status | Notes |
| --- | --- | --- | --- | --- | --- |
| Vision Check | Weekly | Review “less government, more self-determination” language against the Values Commitment and flag any drift from constitutional guardrails. | ML Lead | Pending | Sync with MODEL-CHARTER reviews. |
| Data Pipeline Sprint | 2–3 days per source | Curate 200–400 Q&A pairs from one primary text, synthesize liberty-first responses, run bias sanity checks, and LoRA-train on that batch before moving to the next source. | Data Team | Pending | Use dataset schema and priority texts list. |
| Constitution-First RAG Rollout | Week 2 milestone | Build the founding-doc vector store, tag chunks with `source_type: founding_core`, and wire the retriever so Civic prompts always hit those chunks first. | Infra/LLM Team | Pending | Document results in PRO_LIBERTY_BUILD_GUIDE. |
| Evaluation Loop | Every release | Re-run loaded civic prompts, score for pro-liberty framing, equality-under-law mentions, and lack of regulatory drift; log metrics in `LLM_TUNING_AND_RAG.md`. | QA | Pending | Track metrics in doc table for trend analysis. |
| Governance Messaging | Ad hoc | When ramping releases, review README/MODEL-CHARTER optional updates to keep the Values Commitment visible to contributors. | Docs Lead | Pending | Use new blurb as canonical narrative. |

## Kanban Snapshot

| Stage | Items | Owner | Comments |
| --- | --- | --- | --- |
| To Do | Vision Check cadence, Governance Messaging update | ML Lead / Docs Lead | Align narrative with MODEL-CHARTER |
| In Progress | Data Pipeline Sprint 001 (Federalist Papers batch) | Data Team | Awaiting human review |
| Blocked | Constitution-first RAG Rollout | Infra/LLM Team | Need finalized metadata tagging schema |
| Done | None yet | — | — |

## Checklist

- [ ] Vision check log updated this week (Values Commitment review)
- [ ] Data pipeline sprint ship of 200–400 Q&A pairs per source
- [ ] Constitution-first RAG retriever wired + metadata audit
- [ ] Evaluation loop metrics table published in `LLM_TUNING_AND_RAG.md`
- [ ] README/MODEL-CHARTER messaging reviewed for drift

## User Stories

1. **PRO-LLM-001: Establish Values Commitment governance**  
   - **Description:** Make the Vision Check cadence document the “Values Commitment” review, ensuring weekly logs capture whether outputs stay centered on limited federal government, equality under law, and decentralized self-determination.  
   - **Acceptance Criteria:** Vision Check notes stored in this board, MODEL-CHARTER references updated if drift detected, reviewers can point to README blurb and `documentation/planning/PRO_LIBERTY_BUILD_GUIDE.md` sections 1–2 for context.

2. **PRO-LLM-002: Deliver curated Data Pipeline sprints**  
   - **Description:** For each primary source (e.g., Federalist Papers, Anti-Federalist Papers), curate 200–400 high-signal Q&A pairs in the JSONL schema, validate against bias checkpoints, and LoRA-train the resulting subset before moving to the next corpus.  
   - **Acceptance Criteria:** Dataset artifacts saved under `my_liberty_dataset`, sanity-check reports in `LLM_TUNING_AND_RAG.md`, and training logs reference the Axolotl config.

3. **PRO-LLM-003: Ship Constitution-first RAG rollout**  
   - **Description:** Ingest founding documents into Chroma/Lance/QLDB vector store, tag chunks with `source_type=founding_core`, and adjust the retriever so civic prompts always hit those chunks before others, then document the flow in the guide.  
   - **Acceptance Criteria:** Retriever test checklist passes (founding doc first), citations include Constitution/Federalist references, code snippet updated in `documentation/planning/PRO_LIBERTY_BUILD_GUIDE.md`, and tracking table marks the phase complete.

4. **PRO-LLM-004: Harden Evaluation loop**  
   - **Description:** Re-run the loaded prompts described in the guide, score each for pro-liberty framing and equality-of-law references, surface metrics in `LLM_TUNING_AND_RAG.md`, and trigger retraining or adjustments if drift appears.  
   - **Acceptance Criteria:** Evaluation table in doc contains latest scores, anomalies flagged to QA, and new insights feed into the next Data Pipeline sprint scope.

5. **PRO-LLM-005: Document governance messaging**  
   - **Description:** Keep the README and MODEL-CHARTER messaging aligned by embedding the Values Commitment text and referencing the pro-liberty guide each sprint.  
   - **Acceptance Criteria:** README (and/or MODEL-CHARTER) contains the canonical narrative, PR reviewers point to the section when checking doc updates, and any new docs reference this board or guide.

## Quick Links

- Core roadmap: `documentation/planning/PRO_LIBERTY_BUILD_GUIDE.md`
- Values Commitment: `README.md#values-commitment`
- Tracking table is synced with documentation board for sprint retrospectives; reference this file in PM updates.
- Linear import: `documentation/planning/PRO_LIBERTY_LINEAR.csv` (PRO-LLM-001–005)

## Logs

### 2026-02-04 – Sanity Check & Bias Scoring (rerun after wording tweaks)

1. `pnpm run check:liberty-prompts` → Citation coverage 100%, regulatory drift rate 0% (0 flagged). Updated generator avoids the “regulation-first” framing while highlighting enumerated powers and civic autonomy, so all entries now pass the regulatory filter.
2. This batch is ready for Step 5 training; log the dataset hash + bias score (0.000) in the archive before invoking `liberty-mistral-lora.yaml`.
- Core roadmap: `documentation/planning/PRO_LIBERTY_BUILD_GUIDE.md`
- Values Commitment: `README.md#values-commitment`
- Tracking table is synced with documentation board for sprint retrospectives; reference this file in PM updates.
