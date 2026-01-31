<!-- Please use this template for changes that request an exception to the coding standards or typing rules. -->

## Summary
Brief description of the change (one paragraph):

## Type of change
- [ ] Bug fix
- [ ] Feature
- [ ] Docs
- [ ] Chore
- [ ] **Exception Request** (see below)

## Exception Request (only fill when requesting an exception)
When requesting an exception to the policies (standalone components, Signals, Promise usage, typing), include:
- **Rule(s) to exempt** (e.g., `standalone components`, `no Promises in services`, `no-explicit-any`)
- **Justification** (concise technical rationale, why Observable/typed approach cannot be used)
- **Scope** (files/paths affected)
- **Duration** (how long the exception is expected to last)
- **Owner / Approver** (must be a user listed in `CODEOWNERS`)
- **Governance log entry** (link to `documentation/GOVERNANCE.md` entry or a note that it will be added)

> Approval steps: The PR must include the exception details above in the description and an explicit approver comment from someone listed in `CODEOWNERS`. A governance log entry must be created and linked in the PR before merging.

## Checklist
- [ ] Tests added/updated
- [ ] Lint and typed-lint passes (`pnpm run lint`, `pnpm run lint:typed`)
- [ ] CI green
- [ ] Docs updated (where applicable)

## Risk & Rollback
Describe risk and rollback plan if this change introduces regressions.

---

Thanks for keeping exceptions traceable and time-limited — this helps audits and governance reviews.