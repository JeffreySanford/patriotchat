package main

import (
	"encoding/json"
	"os"
	"testing"
)

func TestRunFundingFetchersCreatesProposals(t *testing.T) {
	// remove existing proposals file if present
	os.Remove("data/sources/funding_proposals.json")
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
	// each proposal should have Funding not nil and EvidenceLinks length >=1
	for _, p := range props {
		if p.Funding == nil {
			t.Fatalf("expected Funding in proposal %s", p.ID)
		}
		if len(p.EvidenceLinks) == 0 {
			t.Fatalf("expected evidence links in proposal %s", p.ID)
		}
	}
}
