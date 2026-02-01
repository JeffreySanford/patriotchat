package main

import "testing"

func TestValidateLLMOutput_acceptsStructuredClaims(t *testing.T) {
	content := `[{"claim":"Neutral overview of policy","sources":["https://example.com/policy"],"timestamp":"2024-09-01T00:00:00Z","attribution":"Policy Team"}]`
	if err := ValidateLLMOutput(content); err != nil {
		t.Fatalf("expected valid response, got error: %v", err)
	}
}

func TestValidateLLMOutput_errorsWhenSourcesMissing(t *testing.T) {
	content := `[{"claim":"Observation with no sources","sources":[]}]`
	if err := ValidateLLMOutput(content); err == nil {
		t.Fatalf("expected validation error for missing sources, got nil")
	}
}

func TestValidateLLMOutput_requiresAttributionForNormativeClaim(t *testing.T) {
	content := `[{"claim":"Extremist content is unacceptable","sources":["https://example.com/guide"]}]`
	if err := ValidateLLMOutput(content); err == nil {
		t.Fatalf("expected attribution error for normative claim, got nil")
	}
}
