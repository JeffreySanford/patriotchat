# Pro-Liberty Dataset Sprint (PRO-LLM-002) Planning

This document captures the next sprint’s work for PRO-LLM-002 (curate high-signal dataset batch + LoRA training). Keep the Values Commitment (`README.md#values-commitment`) in mind while authoring scripts, selecting excerpts, and writing prompts.

## Sprint Goal

Produce one curated batch of 200–400 JSONL prompts/responses derived from a single primary source (e.g., Federalist Papers). Generate liberty-first ground-truth answers, run bias sanity checks, and LoRA-train the batch before moving to the next source.

## Steps

1. **Select Source & Extract Material**
   - Choose a document with constitutional relevance (Federalist Papers essay, Anti-Federalist critique, or Supreme Court majority opinion).
   - Extract 3–5 paragraphs per prompt; store passages in `data/founding/<source-name>.txt`.
   - Track metadata: author, year, section, key principles (enumerated powers, rights, federalism).

2. **Write Values-Aligned Prompts**
   - Use the starter schema from `PRO_LIBERTY_BUILD_GUIDE.md` Section 3.
   - Each prompt asks for constitutional framing (e.g., “Explain how Federalist 10 defends enumerated powers and local sovereignty”).
   - Include instructions to cite the source and emphasize limited federal government, equality under law, and self-determination.

3. **Generate Draft Responses**
   - Use a vetted base model (Claude/Grok) with the Values Commitment system prefix:
     > “You are a constitutionalist assistant. Prioritize limited government, equality under law, and decentralized authority. Cite the Founders when possible.”
   - Create human-edited responses; remove conspiratorial or regulatory language.
   - To bootstrap the JSONL batch from your current sources, run `pnpm run generate:liberty-prompts`. The script compiles the TypeScript generator, produces 1,000 entries in `my_liberty_dataset/train.jsonl`, and keeps everything aligned with `data/founding/`. Human-review and cite each entry before training.
   - Log citations per output (Federalist 10 §, etc.).

4. **Sanity Checks & Bias Scoring**
   - Run each pair through the `LLM_TUNING_AND_RAG.md` red-flag suite plus the new alignment tests (e.g., self-determination check, regulatory drift monitor). Use `pnpm run check:liberty-prompts` to compute a citation/regulatory summary on `my_liberty_dataset/train.jsonl`.
   - Flag any output lacking citation or defaulting to federal-overreach; rework before inclusion.
   - Record bias score (missing citation rate) and mention corrections in the sprint log.

5. **LoRA Training**
   - Append the batch to `my_liberty_dataset/train.jsonl`. Validate JSONL (line counts, UTF-8).
   - Run Axolotl with `liberty-mistral-lora.yaml` (Sections 4/5).
   - Monitor loss/validation metrics; stop after 2–3 epochs or when metrics plateau.
   - Save adapter checkpoint and document dataset hash + training notes in `documentation/planning/PRO_LIBERTY_TRACKING.md` archive.

6. **Evaluation**
   - After training, rerun the golden prompt suite and regulatory drift monitor.
   - Log evaluation results in `LLM_TUNING_AND_RAG.md` (Evaluation Loop section).
   - Note any retracts or retuning needed before next batch.

## Outputs & Deliverables

- `data/founding/<source-name>.txt` + metadata table
- `my_liberty_dataset/train.jsonl` + validation logs
- LoRA adapter checkpoint + training log
- Evaluation metrics (bias score, citation rate)
- Archive entry in `PRO_LIBERTY_TRACKING.md` referencing this sprint and dataset hash

## Next Sprint Prep

Once this batch clears evaluation, repeat the cycle for the next source (Anti-Federalist, Supreme Court opinion, etc.). Always annotate sprint increments with the Values Commitment, referencing this planning doc for context.<|endofpatch|>***End Patch մsorry system can't parse JSON??? Need normal apply_patch not JSON. re-run simpler apply patch text. use same patch content but w usual text. let's redo.***Initially patch failed due to non-JSON? I used JSON maybe not allowed due to string quoting. need second attempt with apply patch plain text. use tool call from earlier? yes use apply_patch with patch text. copy content again but shorter. Let's do.***Detailed patch small. Need to ensure no trailing weird characters. We'll patch.*** let's attempt again.
