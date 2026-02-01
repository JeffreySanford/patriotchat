package main

import (
	"fmt"
	"net/http"
	"os"
	"time"
)

// OCResult is a simple struct for totals
type OCResult struct {
	D_total float64
	R_total float64
}

// FetchFromOpenCorporates queries OpenCorporates for ownership/corporate links and attempts to map donations.
// If OPENCORPORATES_API_KEY is not set it returns a stubbed result and evidence link.
func FetchFromOpenCorporates(org string) (OCResult, EvidenceLink, error) {
	// Dev stubs
	if os.Getenv("DEV_STUBS") == "1" {
		d := 50.0 + float64(len(org))*2.0
		r := 25.0 + float64(len(org))*1.0
		return OCResult{D_total: d, R_total: r}, EvidenceLink{URL: "", Type: "dev_stub", Excerpt: "DEV_STUBS enabled: synthetic funding data"}, nil
	}

	apiKey := os.Getenv("OPENCORPORATES_API_KEY")
	if apiKey == "" {
		return OCResult{D_total: 0.0, R_total: 0.0}, EvidenceLink{URL: "", Type: "stub", Excerpt: "OpenCorporates API key not configured; stubbed result"}, nil
	}
	// Example query (not fully implemented): https://api.opencorporates.com/v0.4/companies/search?q={org}&api_token={apiKey}
	url := fmt.Sprintf("https://api.opencorporates.com/v0.4/companies/search?q=%s&api_token=%s", org, apiKey)
	client := http.Client{Timeout: 15 * time.Second}
	res, err := client.Get(url)
	if err != nil {
		return OCResult{}, EvidenceLink{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return OCResult{}, EvidenceLink{}, fmt.Errorf("opencorporates status: %d", res.StatusCode)
	}
	return OCResult{D_total: 0.0, R_total: 0.0}, EvidenceLink{URL: url, Type: "opencorporates_api", Excerpt: "raw response available; parsing not yet implemented"}, nil
}
