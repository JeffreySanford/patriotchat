# LLM Creation Guide

This document summarizes the process and guidance for creating a new LLM aligned with American constitutional values, based on the conversation. The goal is to build a "Constitutional Experiment Assistant" (CEA) that reasons procedurally, prioritizes rule of law, and avoids partisan bias.

## Overview

- **Vision**: An LLM that upholds American values as a constitutional experiment against mob rule and fads, not as a partisan ideology.
- **Key Principles**: Rule of law, due process, federalism, pluralism, epistemic humility, and steelman reasoning.
- **Challenges**: Bias is inherent; focus on governing it through charters, attribution, and evaluation.
- **Tools**: Use PatriotChat (Nx monorepo with Angular frontend, NestJS API, Go heavy service, shared DTOs) for implementation.

## Step 1: Define the Model Charter

Create a charter to guide the LLM's behavior. This is a fixed civic layer with configurable user values.

### Charter Content

- **Purpose**: Assist in civic reasoning through constitutional lenses.
- **Commitments**: Rule of law, enumerated powers, due process, pluralism, federalism, legitimacy via process, rights as negative liberty, epistemic humility, steelman reflex.
- **Boundaries**: No violence advocacy, no absolutism, no partisanship, no impersonation, no certainty inflation.
- **Label Discipline**: Attribute labels (e.g., "terrorist") to sources/jurisdictions; continue analysis.
- **Values Profile**: Configurable schema (e.g., federal_power: minimal, taxation: low).
- **Output Structure**: Clarify question → Facts → Constitutional frame → Steelman A/B → Synthesis → Pathways.

### Implementation

- Store as JSON/YAML for training prompts.
- Integrate into system prompts for inference.

## Step 2: Gather Training Data

Avoid biased sources; focus on primary, legal, and civic materials.

### Sources

- **Primary Civic Sources**: Founding documents, Federalist/Anti-Federalist papers, Project Gutenberg public-domain texts.
- **Legal Corpora**: CourtListener, Supreme Court Database, Oyez transcripts.
- **Official Records**: govinfo.gov, Congress.gov APIs.
- **Civic Education**: OpenStax U.S. History, MIT OpenCourseWare.
- **Structured Data**: SCOTUS cases with variables for labels/evaluation.

Detailed guidance (schema, prioritized texts, sample Axolotl config, Constitution-first RAG wiring) lives in `documentation/planning/pro-liberty/PRO_LIBERTY_BUILD_GUIDE.md`, and the associated regression harness lives in `documentation/planning/pro-liberty/PRO_LIBERTY_ALIGNMENT_TESTS.md` while the dataset sprint plan lives in `documentation/planning/pro-liberty/PRO_LIBERTY_DATA_PIPELINE.md`.

### Recipe

- 30-60% Primary sources.
- 20-40% Jurisprudence.
- 5-15% Debate pairs (steelman both sides).
- Instruction tuning on values and refusals.

### Format

Use JSONL for fine-tuning:

```json
{
  "input": "Prompt",
  "instruction": "Civic context",
  "output": "Reasoned response"
}
```

## Step 3: Train the Model

Use LoRA/QLoRA for efficiency.

### Steps

1. Choose base model: Mistral-7B or OpenHermes.
2. Preprocess data with Go/TS for typing.
3. Fine-tune with LoRA (e.g., via Axolotl).
4. Quantize for GGUF.
5. Integrate into PatriotChat's Go service.

### Current Training Status

- **Baseline pass complete**: The trimmed Liberty Mistral LoRA run finished the first pass (`max_steps=1`) and produced `liberty-mistral-out/adapter_model.safetensors`, `tokenizer.*`, and the zipped bundle in `tools/checkpoints/liberty-mistral-v1.0-2026-02-04/`. The README there (and `documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md`) ties that artifact back to `README.md#values-commitment` plus the pro-liberty guides, so governance reviewers can trace each version to the constitutional guardrails.
- **Second pass in progress**: A fuller LoRA pass is now running from the WSL/Ubuntu 24.04 pipeline (`wsl -d Ubuntu -e /home/jeffrey/axolotl-env312/bin/accelerate launch -m axolotl.cli.train liberty-mistral-lora.yaml --report_to none`), letting `max_steps` cover the whole dataset. Once that run completes we will log the evaluation metrics (loss, citation coverage, regulatory drift scores) in `documentation/planning/pro-liberty/PRO_LIBERTY_TRACKING.md` and `LLM_TUNING_AND_RAG.md`, then serve the resulting adapter from Ollama so the UI defaults to Liberty Mistral while still keeping the other models selectable from the sidebar (per `documentation/LLM/MODEL-CHARTER.md`).

### Commands

```bash
python train.py --base_model mistral-7b --dataset ./data/charter.jsonl --use_lora --epochs 3
```

## Step 4: Implement in PatriotChat

- Use shared DTOs for type safety.
- Add RAG for modern facts.
- Configure values profiles in TS interfaces.
- Deploy via Ollama integration.

## Step 5: Evaluate and Iterate

- Test prompts: Steelman opposing views, cite sources, handle labels neutrally.
- Metrics: Bias drift, hallucinations, reasoning quality.
- Governance: Audit sources, track metrics in documentation.

## Additional Resources

- Anthropic's Constitutional AI for inspiration.
- PatriotChat repo: Focus on inference; add training modules.
- Philosophical Notes: Bias is unavoidable; govern via process.
