# PatriotChat Security & Governance

## Security Objectives

- Preserve user privacy by keeping all inference (Ollama) and DTOs within locally controlled infrastructure.
- Prevent unauthorized inference of harmful or illegal content; enforce call/response logging plus keyword/regex filters before data leaves the Go proxy.
- Maintain auditable trails for security, legal, and ethics reviews of datasets, models, and guardrails.

## Threat Model

1. **Malicious inputs** – anonymous users may attempt to inject illegal content or disinformation. The Go service filters and logs suspect prompts, plus optional manual review before responses are sent.
2. **Data exfiltration** – inference tokens or datasets must never go to third-party clouds; Ollama runs locally (preferred via Docker) and the Go proxy communicates over internal networks only.
3. **Model drift/backdoor** – all fine-tuned models are computed locally, stored as GGUF artifacts, and checked against validation scripts before rollout.

## Controls

- **DTO validation** – Nest controllers validate every request with `class-validator` DTOs from `@patriotchat/shared`; invalid payloads are rejected before any heavy work occurs.
- **Zone-based monitoring** – Angular uses `Zone.js` so async flows are traceable; no zoneless or standalone components that would obscure stack traces or dependency graphs.
- **Guardrail instrumentation** – Keyword/regex filters in Go, plus whitelist/prompt templates, ensure compliance before any content is emitted.
- **Container isolation** – Ollama and optional databases run under Docker compose (`docker compose up ollama` etc.) so environments stay reproducible and scanned.

## Tiered access & anonymized auditing

- Enforce free/basic/intensive/premium tier rate limits; publish them in the governance log and ensure every rate-limiting change references an approval in that log.
- Require 2FA for every authenticated user to keep the audit trails accountable; store only hashed 2FA metadata and never the original codes.
- Store inference metadata (call/response artifacts, DTO validation traces) in anonymized local logs, then record their hash digests to the approved blockchain ledger for tamper-evident long-term retention. SQL/Mongo stores hold persistent session/profile data but do not retain public inference payloads.

## Dataset Licensing & Model Registry

- Every dataset must include metadata (source, license, version, owner) stored in `documentation/GOVERNANCE.md` and referenced in pull requests.
- Fine-tuned models log MCP checkpoints (`tools/checkpoints`: loss, dataset hash, timestamp). Each version requires manual sign-off from the ethics/legal reviewer before deployment.
- Maintain an artifact store (or Git-tracked metadata file) marking which GGUF models have passed QA plus their guardrail tags.
- For LLM models, use the evaluation checklist in `documentation/LLM/EVALUATION-CHECKLIST.md` to ensure alignment with security and guardrail objectives.

## Review Checklist (per dataset/model change)

- [ ] DTO contracts updated and linted (`pnpm nx lint frontend api shared`).
- [ ] Guardrail regression suite rerun (GitHub Actions topic `guardrail-regressions`).
- [ ] Metrics dashboard reflects new guardrail/latency expectations.
- [ ] Security/ethics review signed off (document reviewer name/date).
- [ ] Dataset licensing approved (compatible with patriotic content policy).
- [ ] Model checkpoint metadata recorded in `tools/checkpoints`.

## Incident Response

- Log illegal content attempts with anonymized request IDs.
- Trigger alerts if guardrail pass rate declines or if filtered prompts escalate.
- Follow documented rollback/playbook described in `README.md` (future update) and notify legal/ethics stakeholders within 24 hours.

## Contacts & Escalation

- Security lead: SecurityOps Team (`security@patriotchat.local`)
- Legal/Ethics reviewer: Legal Counsel (`legal@patriotchat.local`)
- Governance reviewer: Governance Committee (`governance@patriotchat.local`)
- Use repository issue `security` label for tracking reviews and incidents.

## Document maintenance

- Treat this doc, `documentation/METRICS.md`, and `documentation/GOVERNANCE.md` as living records. Whenever workflows, dashboards, or alert thresholds change, update the relevant file and link the change in the review checklist.
