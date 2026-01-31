# Recommended Branch Protection Settings for `master`

Apply these settings in the repository Settings → Branches → Branch protection rules → Add rule (or use the GitHub REST API to automate):

- Branch name pattern: `master` (or `main` if you rename in the future)
- Require a pull request before merging: enabled
- Require approvals: 1 (must be from a `CODEOWNERS` member)
- Require status checks to pass before merging: enabled
  - Required checks (at minimum):
    - `CI Pipeline` (the workflow runs lint/test/guardrail + container build/scan)
    - `lint` (or the specific check label if you prefer)
    - `typed-lint` (the typed ESLint job) — ensure your CI exposes this as a status check name
- Require linear history: enabled (prevents merge commits / enforces rebase-only policy)
- Disallow force pushes: enabled
- Require signed commits: optional (recommended for stricter audit trails)
- Include administrators: optional (recommended: enabled so admins also follow rules)

Notes & Checklist
- After enabling, create a quick PR that modifies a non-critical file (README.md) to validate the rule is enforced.
- If the CI uses different check names than above, adapt the required checks to match the exact status check names emitted by the workflow.
- Document the enabled rules in `README.md` or `documentation/GOVERNANCE.md` so the team knows the merge expectations.

If you want, I can create a PR that includes this file and updates `CODEOWNERS` (done), and draft a short admin checklist for enabling the GitHub branch rules in the UI.