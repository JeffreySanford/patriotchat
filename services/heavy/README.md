# Provider policy & configuration

This document describes data providers used by the `heavy` service for funding and ad signals, which providers are free vs commercial, and how to configure them.

## Provider overview

- **FEC (Federal Election Commission)** — *Free*: federal campaign/PAC contributions. Use `FEC_API_KEY` if required.
- **OpenCorporates** — *Free tier / paid for volume*: corporate ownership and entity linking. Use `OPENCORPORATES_API_KEY` for higher-volume access.
- **Form‑990 (IRS filings)** — *Free*: public filings. Point `FORM990_DATA_PATH` to a local directory with JSON/CSV extracts for ingestion.
- **Meta Ad Library (Meta/Facebook)** — *Public / free with token*: ad transparency API provides ad spend and sponsor info; use `META_ADS_API_KEY`.
- **Google Ad Transparency** — *Public / free with token or limited access*: ad transparency reports (varies by region); use `GOOGLE_ADS_API_KEY`.
- **FollowTheMoney / NIMP** — *Now part of OpenSecrets*: API access is limited / commercial; prefer FEC/OpenCorporates/Form‑990 or licensed OpenSecrets data.
- **OpenSecrets (commercial)** — *Paid / commercial*: licensing and custom datasets; available via contracts. Use only when you have a commercial contract and configure behind a feature flag.

## Default provider priority

Set `AVAILABLE_PROVIDERS` (comma-separated) in `services/heavy/.env`. Example default:

```env
AVAILABLE_PROVIDERS=fec,opencorporates,form990,metaads,googleads
```

Providers are queried in order; ad-library providers (Meta/Google) are used to attach ad-spend evidence and are not added to `owner_donations` totals.

## Configuration & secrets

- Add API keys to `services/heavy/.env` or GitHub Actions secrets:
  - `FEC_API_KEY`
  - `OPENCORPORATES_API_KEY`
  - `FORM990_DATA_PATH` (local path)
  - `META_ADS_API_KEY`
  - `GOOGLE_ADS_API_KEY`
  - `DEV_STUBS=1` to enable deterministic synthetic responses for development and CI.

## Security & governance

- Automated runs produce **proposals** and **audit log** entries; they do NOT automatically change `trust_score` or `leaning_score`.
- Any change that would materially alter `leaning_score` or `trust_score` requires **human reviewer approval** (via `/sources/{id}/approve` with `X-Reviewer`).
- Provider changes and re-ratings must be recorded in `data/sources/proposals.json` and the registry `audit_log`.

## Notes

- Some datasets moved to commercial access; this codebase stubs or flags those providers until keys / licensing is available. Use `DEV_STUBS` for offline development.
- For production, configure provider API keys as secrets in your CI/CD environment and enable only the providers you have rights to use.
