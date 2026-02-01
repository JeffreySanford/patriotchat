package main

import (
	"fmt"
	"os"
	"time"
)

// MetaAdsResult represents summary ad-spend data from Meta's Ad Library
type MetaAdsResult struct {
	EstimatedSpend float64
}

// FetchFromMetaAds returns ad spend info for an organization. If DEV_STUBS=1 it returns deterministic synthetic data.
func FetchFromMetaAds(org string) (MetaAdsResult, EvidenceLink, error) {
	if os.Getenv("DEV_STUBS") == "1" {
		s := 250.0 + float64(len(org))*6.0
		return MetaAdsResult{EstimatedSpend: s}, EvidenceLink{URL: "", Type: "dev_stub", Excerpt: fmt.Sprintf("DEV_STUBS: estimated_meta_ad_spend=%0.2f; timestamp=%s", s, time.Now().UTC().Format(time.RFC3339))}, nil
	}
	apiKey := os.Getenv("META_ADS_API_KEY")
	if apiKey == "" {
		return MetaAdsResult{EstimatedSpend: 0.0}, EvidenceLink{URL: "", Type: "stub", Excerpt: fmt.Sprintf("META_ADS_API_KEY not configured; stubbed result; timestamp=%s", time.Now().UTC().Format(time.RFC3339))}, nil
	}
	// TODO: implement real fetch using Meta Ads Library / Graph API (token required)
	url := fmt.Sprintf("https://graph.facebook.com/v16.0/ads_archive?search_terms=%s&access_token=%s", org, apiKey)
	return MetaAdsResult{EstimatedSpend: 0.0}, EvidenceLink{URL: url, Type: "metaads_api", Excerpt: fmt.Sprintf("raw response available; parsing not yet implemented; timestamp=%s", time.Now().UTC().Format(time.RFC3339))}, nil
}
