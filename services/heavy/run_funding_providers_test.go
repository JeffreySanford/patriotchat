package main

import (
	"encoding/json"
	"os"
	"testing"
)

func TestRunFundingFetchersWithProviderSubset(t *testing.T) {
	// ensure proposals file is removed
	os.Remove("data/sources/funding_proposals.json")
	// set providers to fec and form990 only
	os.Setenv("AVAILABLE_PROVIDERS", "fec,form990")
	defer os.Unsetenv("AVAILABLE_PROVIDERS")
	if err := RunFundingFetchers(); err != nil {
		t.Fatalf("RunFundingFetchers failed: %v", err)
	}
	b, err := os.ReadFile("data/sources/funding_proposals.json")
	if err != nil {
		t.Fatalf("expected proposals file: %v", err)
	}
	var props []Proposal
	if err := json.Unmarshal(b, &props); err != nil {
		t.Fatalf("failed to parse proposals: %v", err)
	}
	if len(props) == 0 {
		t.Fatalf("expected at least one proposal")
	}
	// check each proposal has ProvidersUsed and ProviderStubs fields
	for _, p := range props {
		// ProvidersUsed may be empty if both providers stubbed; ensure ProviderStubs contains expected entries
		if len(p.ProvidersUsed) == 0 && len(p.ProviderStubs) == 0 {
			t.Fatalf("expected ProvidersUsed or ProviderStubs to be set for %s", p.ID)
		}
	}
}
