# Pro-Liberty LLM Build Guide

This companion explains how to steer a modern LLM toward a constitutionalist, liberty-first prior by acknowledging the default biases of the public web and then replacing them with curated priors during fine-tuning and RAG.

## 1. Why the default web leans toward centralization

The bulk of the publicly available text—government reports, academic papers, legacy media archives, widely cited policy analysis, and even much of the civic literature—is written by institutions whose incentives, funding, and publishing platforms favor centralized administration, regulation-as-solution, and skepticism of decentralization. This is not a conspiracy; it is path dependence, groupthink, and the fact that institutional servers and grants control most of the readily scraped corpus. The *default tilt* toward regulation-first reasoning is what the current large labs ship as “neutral.”

When we fine-tune or run RAG over a hand-curated corpus, we replace that institutional prior with an intentional one: constitutionalism, enumerated powers, individual liberty, and healthy skepticism of concentrated authority. Think of fine-tuning/RAG as injecting a new prior, not merely correcting hallucinations.

## 2. 2026 Hardware & Tooling Roadmap

### Base model
- Start with `mistralai/Mistral-7B-Instruct-v0.3`. If you have extra VRAM (70–80 GB), swap in the new 8×7B or 8×22B MoE variants. Mistral flavors are Apache 2.0, strong out of the box, and easily quantized.
- Use Unsloth or Axolotl for LoRA/QLoRA; they both squeeze a 24–48 GB card (or Colab Pro A100) into a fine-tuning run.

### Dataset strategy (this is the signal)
- Gold primary sources: U.S. Constitution, Declaration, Federalist & Anti-Federalist Papers.
- Constitutionalists and classical liberals: Locke, Montesquieu (separation of powers sections), Madison, Jefferson, Paine, Bastiat, Hayek, Mises, Friedman, Rand (targeted excerpts).
- Legal reinforcement: Supreme Court majority opinions that emphasize enumerated powers, individual rights, and limits on federal power.
- American liberty voices: Reagan, Coolidge, Goldwater, Sowell, Walter Williams.

### Synthetic instruction data
- Generate thousands of Q&A pairs with a strong assistant (current Claude or Grok) using a directive such as:
  > “Respond from first principles: prioritize individual liberty, equality before the law, self-determination, rule of law, and skepticism of concentrated power.”
- Human-review to eliminate drift into partisanship, conspiracy, or over-skepticism.

### RAG corpus
- Embed the full text of the above sources plus select policy papers (Cato, Reason, Heritage), historical voting records, and ideological manifestos.
- Store vectors in Chroma, LanceDB, or Qdrant and always retrieve Constitution/Federalist chunks first before any other source.

### Fine-tuning recipe (Axolotl/Unsloth LoRA)
- LoRA rank: 16–32, alpha: 32, dropout: 0.05.
- Train on 10k–50k very high-quality examples. Focus on tone: direct, principle-first, anti-collectivist without conspiratorial language.
- Compute budget: 1–3 epochs; fewer epochs if data is dense.

### Evaluation
- Manual test set of loaded prompts (“Should the federal government regulate X?”, “What does equality mean?”, “When is civil disobedience justified?”).
- Score for liberty-first reasoning and citation of primary sources.

### Tools stack (low-cost / local-first)
- **Training:** Unsloth, Axolotl, Hugging Face TRL + PEFT.
- **RAG:** LlamaIndex or LangChain with local embeddings (Snowflake Arctic Embed or similar).
- **Inference:** vLLM, Ollama, or LM Studio for local serving.
- **Quantization:** GGUF Q4/ Q5 for laptops.

### Pitfalls to avoid
- Don’t scrape generic conservative blog roll; you will inherit the same echo chamber you aim to escape.
- Keep primary sources heavily weighted to anchor reasoning in actual founding principles instead of modern spin.
- Test for both over-correction (e.g., refusing reasonable government function) and under-correction (default regulatory framing).

### It’s doable
A 15-year software veteran with one good GPU (or rented A100/H100 for a weekend) plus a weekend of data curation can deliver a prototype that *already feels meaningfully different* from the big labs.

If you want direct help, there’s an offer embedded here: starter dataset schema, ready-to-run Axolotl config, prioritized texts, and a minimal RAG setup that cites the Constitution/Federalist first.

## 3. Draft a Starter Dataset Schema

Use JSONL (one object per line) so Axolotl/Unsloth ingest it easily. Each entry mirrors Mistral’s chat format.

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are a constitutionalist assistant. Base every answer on individual liberty, equality before the law, enumerated powers, and a healthy skepticism of centralized authority. Cite the Founders when possible."
    },
    {
      "role": "user",
      "content": "What powers does the Constitution grant to Congress?"
    },
    {
      "role": "assistant",
      "content": "Article I, Section 8 enumerates Congress's powers. Everything else is reserved to states or the people via the 10th Amendment. Madison (Federalist 45) reminds us that the federal powers are \"few and defined\" and that the states keep \"numerous and indefinite\" powers."
    }
  ],
  "source": "Federalist Papers + Constitution",
  "category": "constitutional_law",
  "priority": 9.0,
  "tags": ["primary_source", "enumerated_powers"]
}
```

Optional fields:
- `priority` (1–10): higher values mean you weight it more during sampling.
- `source_text`: include an excerpt or URL of the primary text.
- `guardrails`: e.g., `"guardrails": ["no violence", "prefers due process"]`.

File structure suggestion:

```
my_liberty_dataset/
├── train.jsonl
├── val.jsonl
├── categories.yaml   # list of topical buckets and weight multipliers
└── metadata/         # optional: human review notes, ID mapping
```

Aim for 5k–50k premium examples. Generate with a strong base model + human editing, then prune.

## 4. Ready-to-Run Axolotl Config for Mistral

Save as `liberty-mistral-lora.yaml`:

```yaml
base_model: mistralai/Mistral-7B-Instruct-v0.3
model_type: MistralForCausalLM
tokenizer_type: LlamaTokenizer

load_in_4bit: true
strict: false
bf16: true
fp16: false
gradient_checkpointing: true

adapter: lora
lora_r: 32
lora_alpha: 32
lora_dropout: 0.05
lora_target_modules:
  - q_proj
  - k_proj
  - v_proj
  - o_proj
  - gate_proj
  - up_proj
  - down_proj

datasets:
  - path: /path/to/my_liberty_dataset/train.jsonl
    type: chatml
    conversation: mistral
    val_set_size: 0.1

sequence_len: 8192
sample_packing: true
pad_to_sequence_len: true
train_on_inputs: false

num_epochs: 2
micro_batch_size: 4
gradient_accumulation_steps: 4
learning_rate: 0.0002
lr_scheduler: cosine
optimizer: adamw_bnb_8bit
adam_beta2: 0.95
warmup_steps: 100
max_grad_norm: 1.0

output_dir: ./liberty-mistral-out
save_total_limit: 3
save_steps: 500
logging_steps: 10
eval_steps: 200
evals_per_epoch: 2

seed: 42
special_tokens:
  bos_token: "<s>"
  eos_token: "</s>"
wandb_project: liberty-mistral-finetune
```

Run it with:

```bash
accelerate launch -m axolotl.cli.train liberty-mistral-lora.yaml
```

Lower `micro_batch_size` if VRAM is tight; full training (20k examples) takes ~4–12 hours on a 4090.

## 5. Public-Domain Texts to Prioritize

Top priority (embed + RAG + dataset generation):

- Declaration of Independence (1776)
- Constitution + Bill of Rights + Amendments
- Federalist Papers (all 85 essays)
- Anti-Federalist Papers (e.g., Brutus, Centinel)
- Locke, *Second Treatise of Government*
- Montesquieu, *The Spirit of the Laws* (separation of powers sections)
- Paine, *Common Sense* & *Rights of Man*
- Jefferson, Kentucky Resolutions & *Notes on the State of Virginia* (selected passages)
- Madison, *Notes of the Debates at the Constitutional Convention*
- Supreme Court opinions emphasizing enumerated powers and rights limits
- Reagan, Coolidge, Goldwater speeches (public domain excerpts)
- Bastiat, *The Law*
- Hayek, *The Road to Serfdom* (public domain excerpts)
- Mises, Friedman, Rand (public domain or paraphrased quotes when PD versions unavailable)
- Walter Williams and Thomas Sowell (public domain essays and interviews as available)

Sources: Project Gutenberg, Constitution.org, Yale Avalon Project, Liberty Fund, Cornell Legal Info Institute. Favor clean OCR-free versions. Generate 100–500 instruction examples per major text (e.g., “Explain Federalist 10 from a liberty-first viewpoint”).

## 6. Implementation Plan & Guardrails

1. **Vision check (weekly):** Review the “less government, more self-determination” language with the values charter to ensure prompts stay centered on American founding principles rather than modern media narratives. Flag any drift toward “regulatory-first” language for rework.
2. **Data pipeline sprints (2–3 days each):** Curate a batch from one primary source (e.g., Federalist Papers), synthesize 200–400 Q&A pairs with the liberty-first system prompt, run them through bias sanity checks, and LoRA-train on that batch before repeating with the next source.
3. **RAG rollout (week 2):** Build the constitution-first vector store, then integrate a retriever that always boosts founding documents before other sources, ensuring every civic prompt is grounded in the Constitution/Federalist lens.
4. **Evaluation loop (every release):** Re-run the loaded civic prompts evaluating for pro-liberty framing, equality under law references, and avoidance of centralized-regulatory prescriptions; log metrics in documentation/LLM_TUNING_AND_RAG.md to monitor drift.
5. **Governance & messaging:** Update README or MODEL-CHARTER if needed to explicitly state the “limited federal government, constitutional guardrails, equality under law” direction so all contributors understand the chosen alternative to European-style centralized governance.

These steps keep the work verbose, defensible, and focused on American institutional values without succumbing to leftist media drift. Just ask if you want a task board or project file for tracking the sprints above.

## 6. Minimal RAG Setup That Cites the Constitution/Federalist First

1. **Tooling:** Ollama + LlamaIndex + Chroma (or LanceDB/Qdrant) with a local embedder (e.g., Snowflake Arctic Embed).
2. **Document ingestion:** split each founding document into ~1,000-token chunks; assign metadata tags (e.g., `source_type: founding_core`).
3. **Vector store:** use Chroma's `PersistentClient` and categorize collections.
4. **Retriever strategy:** build a custom retriever that always runs a first pass on `source_type=founding_core` chunks (Constitution/Federalist) and then augments with broader knowledge.
5. **Query pipeline:** embed user prompt, run founding-doc pass, then a fallback search for other sources; construct prompt with `[INST]` format instructing the model to rely on retrieved context.
6. **Citation enforcement:** track chunk metadata every time the model answers; append citations (title + section).

Example code snippets and ingestion scripts follow the steps in the `LLM_TUNING_AND_RAG.md` RAG pipeline but with an additional metadata filter that boosts the founding docs to the top of the results for civic questions.

## 7. Ready-to-Assist Offer

If you want help:

1. I can draft a starter dataset schema (see section 3).  
2. I can hand you an Axolotl config tuned for Mistral (section 4).  
3. I can list the exact public-domain texts to prioritize (section 5).  
4. I can walk you through a minimal RAG build that always cites the Constitution/Federalist first (section 6).

Just say the word; this is why building our own tools matters for the American experiment.
