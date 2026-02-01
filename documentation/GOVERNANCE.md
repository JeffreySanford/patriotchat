# PatriotChat Governance Log

Use this log to track datasets, models, guardrails, and ethics reviews before they reach production. Each entry should include the owner, license, datasets involved, and any security/legal sign-off.

## Contacts & approvals

- Security lead: SecurityOps Team (`security@patriotchat.local`)
- Legal/Ethics reviewer: Legal Counsel (`legal@patriotchat.local`)
- Governance reviewer: Governance Committee (`governance@patriotchat.local`)

## Document maintenance

- Update this log whenever datasets/models are added or retuned; reference the relevant issue/PR and metric changes.
- Keep `documentation/METRICS.md` and `documentation/SECURITY.md` in sync with any governance updates so the audit trail remains complete.
- For LLM training data and models, follow the sources and charter in `documentation/LLM/` and ensure ethical reviews align with the constitutional values outlined.

## Hybrid storage & blockchain audit anchoring

- Persist user/session metadata in SQL/Mongo while keeping inference and guardrail logs anonymized; do not store raw public content.
- After writing local logs, compute hash digests and anchor them to the approved blockchain ledger for immutable audit proof. Only the hashes are stored on-chain, while the actual audit files remain in governed storage.
- Describe the anonymized/auditing workflow in every PR that touches rate limits, guardrails, or logging so reviewers understand where sensitive data lives and where the blockchain anchoring happens.

| Date | Artifact | Owner | License | Guardrail Tags | Notes |
| --- | --- | --- | --- | --- | --- |
| 2026-01-01 | Base patriotic corpus | DataOps | CC-BY-SA 4.0 | patriotism, civics | Initial dataset, reviewed. |
| TBD | [New dataset/model] | TBD | TBD | TBD | Placeholder for future entries. |

## Updates

- Always cite the approval ticket or issue when adding a row.
- Include a link to `tools/checkpoints` metadata when logging fine-tuned model artifacts.
- Record dataset hashes + upload dates for traceability.

## Review Process

1. Submit artifact change via PR referencing this log.
2. Security/legal reviewer signs off in PR body (name + date).
3. Guardrail/metrics owner verifies benchmarks in `documentation/METRICS.md`.
4. Merge only after CI gates and metrics update are green.
