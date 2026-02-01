package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

// FECResult is a simple struct for totals.
type FECResult struct {
	D_total float64 `json:"d_total"`
	R_total float64 `json:"r_total"`
}

// FetchFromFEC fetches candidate/committee contributions for a given organization id or owner
// If FEC_API_KEY is not set, it returns a stubbed result and an evidence link noting the stub.
func FetchFromFEC(query string) (FECResult, EvidenceLink, error) {
	// Dev stubs: return deterministic synthetic data when DEV_STUBS=1
	if os.Getenv("DEV_STUBS") == "1" {
		d := 1000.0 + float64(len(query))*10.0
		r := 500.0 + float64(len(query))*5.0
		return FECResult{D_total: d, R_total: r}, EvidenceLink{URL: "", Type: "dev_stub", Excerpt: "DEV_STUBS enabled: synthetic funding data"}, nil
	}

	apiKey := os.Getenv("FEC_API_KEY")
	if apiKey == "" {
		// stubbed
		return FECResult{D_total: 0.0, R_total: 0.0}, EvidenceLink{URL: "", Type: "stub", Excerpt: "FEC API key not configured; stubbed result"}, nil
	}
	// Example call (simple): https://api.open.fec.gov/v1/committee/search/?q={query}&api_key=API_KEY
	url := fmt.Sprintf("https://api.open.fec.gov/v1/committees/search/?q=%s&api_key=%s", query, apiKey)
	client := http.Client{Timeout: 15 * time.Second}
	res, err := client.Get(url)
	if err != nil {
		return FECResult{}, EvidenceLink{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return FECResult{}, EvidenceLink{}, fmt.Errorf("fec api status: %d", res.StatusCode)
	}
	// For now, we won't parse full response; return stubbed zero and an evidence link to the query
	e := EvidenceLink{URL: url, Type: "fec_api", Excerpt: "raw response available; parsing not yet implemented"}
	return FECResult{D_total: 0.0, R_total: 0.0}, e, nil
}
