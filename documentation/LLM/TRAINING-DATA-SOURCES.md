# Training Data Sources

This document lists recommended sources for training data to build a constitutional, non-partisan LLM. Focus on primary, legal, and civic materials to minimize bias.

## Primary Civic Sources

- **Founding Documents**: Constitution, Bill of Rights, Federalist/Anti-Federalist Papers.
- **Founders Online**: Correspondence and writings from the Founding era.
- **Avalon Project**: Primary documents from constitutional history.
- **Project Gutenberg**: Public-domain political philosophy and American civic texts (e.g., Tocqueville, classic civics works).

## Legal Corpora

- **CourtListener**: Millions of court opinions, dockets, oral arguments.
- **Supreme Court Database**: Structured SCOTUS case variables for labels and evaluation.
- **Oyez**: Oral arguments and transcripts for SCOTUS cases.

## Official Records

- **govinfo.gov API**: Congressional materials and official documents.
- **Congress.gov API**: Bulk data for legislative records.

## Civic Education

- **OpenStax U.S. History**: Openly licensed (CC BY) structured civic education.
- **MIT OpenCourseWare**: Reading lists and academic materials on civics and history.

## Structured Data

- **SCOTUS Cases**: With metadata for supervised learning on legal reasoning.

## Recipe for Mixing Data

- 30-60%: Primary sources for core values.
- 20-40%: Jurisprudence for reasoning patterns.
- 5-15%: Debate pairs to teach steelman and trade-offs.
- Instruction tuning: Explicit values, refusals, and humility.

## Format

Use JSONL for training:

```json
{
  "input": "What is the role of federalism?",
  "instruction": "Explain using constitutional principles and historical context.",
  "output": "Federalism divides power between national and state governments..."
}
```

## Cautions

- Avoid modern news or partisan sources.
- Check licenses for training use (e.g., some academic sources restrict redistribution).
- Balance voices by method (primary vs. commentary) rather than ideology.
