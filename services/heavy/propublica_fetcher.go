package main

// Deprecated: ProPublica public APIs have been retired or limited. This fetcher is deprecated and left as a placeholder.
// Do not rely on ProPublica for automated funding updates; use FEC, FollowTheMoney, OpenCorporates, and Form-990 sources instead.

// PropublicaResult kept as a minimal type for backwards compatibility.
type PropublicaResult struct {
	D_total float64
	R_total float64
}

// FetchFromProPublica kept for backwards-compatibility and will return stubbed results.
func FetchFromProPublica(org string) (PropublicaResult, EvidenceLink, error) {
	return PropublicaResult{D_total: 0.0, R_total: 0.0}, EvidenceLink{URL: "", Type: "stub", Excerpt: "ProPublica deprecated; no data fetched"}, nil
}
