package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"time"
)

var normativeRE = regexp.MustCompile(`(?i)\b(neo-?fascist|fascist|hate group|extremist|violent|racist|sexist|homophobic|promoting traditional gender roles)\b`)

type LLMClaim struct {
	Claim       string   `json:"claim"`
	Sources     []string `json:"sources"`
	Timestamp   string   `json:"timestamp,omitempty"`
	Attribution string   `json:"attribution,omitempty"`
}

// ValidateLLMOutput checks JSON schema and enforces attribution for normative claims
func ValidateLLMOutput(content string) error {
	content = strings.TrimSpace(content)
	claims, err := extractClaims(content)
	if err != nil {
		return err
	}
	if len(claims) == 0 {
		return errors.New("no claims returned")
	}
	for i, c := range claims {
		if strings.TrimSpace(c.Claim) == "" {
			return fmt.Errorf("empty claim at index %d", i)
		}
		// sources must include at least one valid URL
		if len(c.Sources) == 0 {
			return errors.New("missing sources for claim: '" + c.Claim + "'")
		}
		for _, s := range c.Sources {
			if err := validateURL(s); err != nil {
				return errors.New("invalid source URL '" + s + "' for claim: '" + c.Claim + "'")
			}
		}
		// if normative language exists in claim, ensure attribution present
		if normativeRE.MatchString(c.Claim) && strings.TrimSpace(c.Attribution) == "" {
			return errors.New("normative term detected but missing attribution for claim: '" + c.Claim + "'")
		}
		// ensure timestamp is at least present or try to parse
		if strings.TrimSpace(c.Timestamp) != "" {
			if _, err := time.Parse(time.RFC3339, c.Timestamp); err != nil {
				return errors.New("invalid timestamp format for claim: '" + c.Claim + "', must be ISO8601")
			}
		}
	}
	return nil
}

func validateURL(u string) error {
	normalized, err := normalizeURL(u)
	if err != nil {
		return err
	}
	parsed, err := url.Parse(normalized)
	if err != nil {
		return err
	}
	if parsed.Scheme != "http" && parsed.Scheme != "https" {
		return errors.New("url scheme must be http or https")
	}
	return nil
}

func normalizeURL(raw string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", errors.New("empty url")
	}
	if strings.HasPrefix(raw, "http://") || strings.HasPrefix(raw, "https://") {
		return raw, nil
	}
	if idx := strings.Index(raw, "http://"); idx != -1 {
		return raw[idx:], nil
	}
	if idx := strings.Index(raw, "https://"); idx != -1 {
		return raw[idx:], nil
	}
	return "", errors.New("url must start with http:// or https://")
}

func extractClaims(content string) ([]LLMClaim, error) {
	var claims []LLMClaim
	if err := json.Unmarshal([]byte(content), &claims); err == nil {
		return claims, nil
	}

	var wrapper struct {
		Facts          []LLMClaim `json:"Facts"`
		Interpretation []LLMClaim `json:"Interpretation"`
	}
	if err := json.Unmarshal([]byte(content), &wrapper); err == nil {
		if len(wrapper.Facts)+len(wrapper.Interpretation) > 0 {
			return append(wrapper.Facts, wrapper.Interpretation...), nil
		}
	}

	var generic map[string][]LLMClaim
	if err := json.Unmarshal([]byte(content), &generic); err == nil {
		aggregated := []LLMClaim{}
		for _, list := range generic {
			aggregated = append(aggregated, list...)
		}
		if len(aggregated) > 0 {
			return aggregated, nil
		}
	}

	return nil, errors.New("response is not valid JSON array of claims")
}
