# Incident Response Playbook

Purpose
- Outline detection, triage, containment, eradication, recovery, and post-incident review steps for security, guardrail, and data incidents.

Scope
- Applies to data exfiltration, guardrail failures, model drift/backdoor discoveries, and critical availability incidents.

Process
1. Detection & Triage
   - Create an issue with label `security` and include anonymized request IDs, timeline, and relevant logs (no raw user content).
   - Assign SecurityOps and the Governance reviewer.
2. Containment
   - If inference/model behavior is unsafe, take the model out of serving immediately; follow rollback steps in `tools/checkpoints` metadata.
   - Revoke keys if token leakage is suspected and rotate credentials.
3. Eradication & Recovery
   - Patch or replace the offending artifact; re-run the guardrail regression suite; validate metrics (guardrail pass rate, hallucination tests).
   - Re-deploy after passing CI and manual sign-off by SecurityOps and Legal/Ethics when applicable.
4. Post-incident Review
   - Produce a short incident report with timeline, root cause, impact estimation, and remediation steps.
   - Record the incident in the governance log with relevant artifacts (issue/PR numbers) and a list of owners.

Contacts
- Security lead: `security@patriotchat.local`
- Legal/Ethics reviewer: `legal@patriotchat.local`
- Governance reviewer: `governance@patriotchat.local`

Notes
- Preserve privacy: do not store raw inference payloads in public issues; use hashed/anonymized identifiers.
- For severe incidents, follow legal reporting and notification obligations per applicable jurisdiction.