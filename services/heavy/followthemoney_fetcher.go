package main

import "os"

// FTMResult simple struct for totals
type FTMResult struct {
	D_total float64
	R_total float64
}

// Deprecated: FollowTheMoney has merged into OpenSecrets and public API access has been limited or moved under licensing.
// This fetcher now returns a deprecation stub. Use FEC, OpenCorporates, Form-990, or licensed OpenSecrets data instead.
func FetchFromFollowTheMoney(org string) (FTMResult, EvidenceLink, error) {
	// preserve DEV_STUBS behavior for tests/development
	if os.Getenv("DEV_STUBS") == "1" {
		d := 200.0 + float64(len(org))*8.0
		r := 100.0 + float64(len(org))*4.0
		return FTMResult{D_total: d, R_total: r}, EvidenceLink{URL: "", Type: "dev_stub", Excerpt: "DEV_STUBS enabled: synthetic funding data"}, nil
	}
	return FTMResult{D_total: 0.0, R_total: 0.0}, EvidenceLink{URL: "", Type: "deprecated", Excerpt: "FollowTheMoney merged into OpenSecrets; public API access is limited or commercial"}, nil
}
