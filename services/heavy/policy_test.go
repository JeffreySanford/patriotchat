package main

import (
	"encoding/json"
	"os"
	"testing"
)

func TestSelectEvidenceSourcesBlacklist(t *testing.T) {
	b, err := os.ReadFile("data/sources/registry.json")
	if err != nil {
		t.Fatalf("failed to read registry: %v", err)
	}
	var srcs []Source
	if err := json.Unmarshal(b, &srcs); err != nil {
		t.Fatalf("failed to unmarshal registry: %v", err)
	}
	p, err := LoadPolicy("data/sources/policy.json")
	if err != nil {
		t.Fatalf("failed to load policy: %v", err)
	}
	selected := SelectEvidenceSources(srcs, p)
	// Ensure blacklisted ids are not present
	for _, s := range selected {
		if s.ID == "splc" {
			t.Errorf("splc should be blacklisted but was selected")
		}
		if s.ID == "bbc" {
			t.Errorf("bbc should be blacklisted but was selected")
		}
	}
	// Ensure whitelist entries are present
	foundAP := false
	for _, s := range selected {
		if s.ID == "ap" {
			foundAP = true
		}
	}
	if !foundAP {
		t.Errorf("ap should be included via whitelist")
	}
}

func TestSelectEvidenceSourcesThresholds(t *testing.T) {
	// Create small synthetic sources to test threshold logic
	srcs := []Source{
		{ID: "low", TrustScore: 0.1, Indicators: Indicators{PrimaryLinks: 1, ConcordanceScore: 0.2}},
		{ID: "good", TrustScore: 0.9, Indicators: Indicators{PrimaryLinks: 5, ConcordanceScore: 0.9}},
	}
	p := Policy{MinTrustScore: 0.6, MinConcordanceScore: 0.75, MinPrimaryLinks: 3, Whitelist: []string{}, Blacklist: []string{}}
	selected := SelectEvidenceSources(srcs, p)
	if len(selected) != 1 || selected[0].ID != "good" {
		t.Fatalf("expected only 'good' to be selected, got: %#v", selected)
	}
}
