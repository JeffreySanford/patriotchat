package main

import (
	"encoding/json"
	"os"
	"regexp"
	"testing"
)

type registryEntry struct {
	ID             string   `json:"id"`
	EditorialNotes []string `json:"editorial_notes"`
}

func TestRegistryEditorialNotesNeutral(t *testing.T) {
	b, err := os.ReadFile("data/sources/registry.json")
	if err != nil {
		t.Fatalf("failed to read registry: %v", err)
	}
	var entries []registryEntry
	if err := json.Unmarshal(b, &entries); err != nil {
		t.Fatalf("failed to unmarshal registry: %v", err)
	}

	// subjective phrases to flag in editorial notes
	subjectiveRE := regexp.MustCompile(`(?i)\b(pro-?globalist|anti-?american|pro-?american|may carry|often emphasizes|consider the corresponding)\b`)

	for _, e := range entries {
		for _, note := range e.EditorialNotes {
			if normativeRE.MatchString(note) {
				t.Errorf("%s: editorial_note contains normative term: %q", e.ID, note)
			}
			if subjectiveRE.MatchString(note) {
				t.Errorf("%s: editorial_note contains subjective phrasing: %q", e.ID, note)
			}
		}
	}
}
