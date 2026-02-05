# Pro-Liberty Dataset Sprint (PRO-LLM-002) Planning

This document captures the next sprint for PRO-LLM-002 (curate a hand-picked dataset batch, run alignment checks, and execute a LoRA pass). Keep the Values Commitment (`README.md#values-commitment`) as the canonical narrative while writing prompts, curating citations, and training the model.

## Sprint Goal

Produce one curated batch of 200–400 JSONL prompts/responses sourced from a single constitutional text (Federalist Papers, Anti-Federalist essays, Supreme Court opinions, or founding speeches). Each entry should foreground limited federal government, enumerated powers, equality under law, and decentralized self-determination before moving to the next corpus.

## Concrete Steps

1. **Land the Source Material**
   - Store clean text in `data/founding/<author>-<work>.txt` (the `data/founding/` directory already contains the Federalist Papers and related pamphlets). Tag each file with metadata (author, year, excerpt focus such as enumerated power, natural rights, or limited government).
   - Use the starter dataset schema from `PRO_LIBERTY_BUILD_GUIDE.md` Section 3 so every entry includes system/user/assistant messages and citation metadata.

2. **Generate Values-Aligned Prompts**
   - Use `pnpm run generate:liberty-prompts` (see `scripts/pro_liberty_prompt_generator.ts`) to seed ~1,000 draft entries from `data/founding`. Human-review each entry, replace any regulatory drift with enumerated-powers framing, and ensure citations reference founding texts.
   - Build a `my_liberty_dataset/train.jsonl` with the curated subset, keeping a `priority` field that weights primary sources higher.

3. **Bootstrapped Responses**
   - Use the Values Commitment system prompt (see `PRO_LIBERTY_BUILD_GUIDE.md` Section 4) when asking Grok/Claude to draft answers.
   - Human-edit to remove any conspiratorial language, adding direct references to Madison, Hamilton, or Jefferson where relevant.

4. **Sanity Checks & Alignment Tests**
   - Run the red-flag suite from `LLM_TUNING_AND_RAG.md` plus the new `PRO_LIBERTY_ALIGNMENT_TESTS.md` (see this folder) that checks for:
     - Explicit enumerated powers citations (Federalist 10/45, Tenth Amendment).
     - Self-determination mentions before recommending regulation.
     - Equality under law references (Due Process Clause, Equal Protection in context).
   - Reword any entries that drift toward centralized/regulatory language before advancing.
   - Document citation coverage, regulatory drift score, and corrections in this sprint log and `PRO_LIBERTY_TRACKING.md`.

5. **Adapter Training**
   - Validate JSONL formatting, then trigger Axolotl with `liberty-mistral-lora.yaml`. Use `max_steps=1` for initial layout, then schedule a full run (2–3 epochs, sample packing on 8,192 tokens).
   - After training, copy `liberty-mistral-out/adapter_config.json` into `tools/checkpoints/liberty-mistral-v1.0-<date>/` (with the zipped bundle) so the artifact is traceable.

6. **Evaluation Loop**
   - Run the golden prompt suite plus regulatory drift monitor (the same set referenced in `PRO_LIBERTY_ALIGNMENT_TESTS.md`). Log results in `LLM_TUNING_AND_RAG.md` and in this tracking doc.
   - If drift reappears, revisit the dataset (steps 1–3) before the next sprint.

## Deliverables

- Clean excerpts flagged for enumerated powers and stored under `data/founding`.
- `my_liberty_dataset/train.jsonl` plus bias/sanity reports.
- LoRA adapter (`liberty-mistral-out/adapter_model.safetensors`) bundled in `tools/checkpoints/`.
- Evaluation metrics (bias score, citations) recorded in `LLM_TUNING_AND_RAG.md` and `PRO_LIBERTY_TRACKING.md`.
- New alignment-test ideas documented in `PRO_LIBERTY_ALIGNMENT_TESTS.md`.

## Next Steps

Repeat this loop for the next corpus (Anti-Federalist, Supreme Court) while keeping the Values Commitment front and center. Each sprint entry should reference this doc, `README.md#values-commitment`, and the build guide so the single developer + AI workflow can trace decisions.
