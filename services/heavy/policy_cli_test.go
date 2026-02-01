package main

import (
	"encoding/json"
	"os"
	"testing"
)

func TestAddRemoveBlacklist(t *testing.T) {
	// write a temp policy file
	path := "data/sources/policy.test.json"
	p := Policy{MinTrustScore: 0.5, MinConcordanceScore: 0.5, MinPrimaryLinks: 1, Whitelist: []string{}, Blacklist: []string{}}
	b, _ := json.MarshalIndent(p, "", "  ")
	os.WriteFile(path, b, 0644)
	defer os.Remove(path)

	if err := AddToBlacklist(path, "splc"); err != nil {
		t.Fatalf("AddToBlacklist failed: %v", err)
	}
	p2, _ := LoadPolicy(path)
	found := false
	for _, b := range p2.Blacklist {
		if b == "splc" {
			found = true
		}
	}
	if !found {
		t.Fatalf("splc not found in blacklist after add")
	}
	if err := RemoveFromBlacklist(path, "splc"); err != nil {
		t.Fatalf("RemoveFromBlacklist failed: %v", err)
	}
	p3, _ := LoadPolicy(path)
	for _, b := range p3.Blacklist {
		if b == "splc" {
			t.Fatalf("splc still present after remove")
		}
	}
}
