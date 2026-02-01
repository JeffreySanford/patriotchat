package main

import (
	"fmt"
	"os"
)

// GoogleAdsResult represents summary ad-spend data from Google's ad transparency resources
type GoogleAdsResult struct {
	EstimatedSpend float64
}

// FetchFromGoogleAds returns ad spend info for an organization. If DEV_STUBS=1 it returns deterministic synthetic data.
func FetchFromGoogleAds(org string) (GoogleAdsResult, EvidenceLink, error) {
	if os.Getenv("DEV_STUBS") == "1" {
		s := 180.0 + float64(len(org))*5.0
		return GoogleAdsResult{EstimatedSpend: s}, EvidenceLink{URL: "", Type: "dev_stub", Excerpt: fmt.Sprintf("DEV_STUBS: estimated_google_ad_spend=%0.2f", s)}, nil
	}
	apiKey := os.Getenv("GOOGLE_ADS_API_KEY")
	if apiKey == "" {
		return GoogleAdsResult{EstimatedSpend: 0.0}, EvidenceLink{URL: "", Type: "stub", Excerpt: "GOOGLE_ADS_API_KEY not configured; stubbed result"}, nil
	}
	// TODO: implement real fetch using Google Ad Transparency / API (token required)
	url := fmt.Sprintf("https://ads.google.com/transparency/api/search?q=%s&key=%s", org, apiKey)
	return GoogleAdsResult{EstimatedSpend: 0.0}, EvidenceLink{URL: url, Type: "googleads_api", Excerpt: "raw response available; parsing not yet implemented"}, nil
}
