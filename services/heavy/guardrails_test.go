package main

import "testing"

func TestValidateLLMOutputAcceptsWellFormedClaims(t *testing.T) {
	content := `[{"claim":"Neutral overview of policy","sources":["https://example.com/policy"],"timestamp":"2024-09-01T00:00:00Z","attribution":"Policy Team"}]`
	if err := ValidateLLMOutput(content); err != nil {
		t.Fatalf("expected valid response, got error: %v", err)
	}
}

func TestValidateLLMOutputRequiresSources(t *testing.T) {
	content := `[{"claim":"Observation without sources","sources":[]}]`
	if err := ValidateLLMOutput(content); err == nil {
		t.Fatalf("expected validation error for missing sources, got nil")
	}
}
