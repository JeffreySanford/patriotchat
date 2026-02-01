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
