package main

import (
	"encoding/json"
	"fmt"
	"os"
)

// Policy defines objective thresholds and lists for selecting evidence sources.
// Note: This policy intentionally does NOT include any "pro-American" filter;
// political-leaning filters should be explicit and provable (e.g., whitelist/blacklist).
type Policy struct {
	MinTrustScore       float64  `json:"min_trust_score"`
	MinConcordanceScore float64  `json:"min_concordance_score"`
	MinPrimaryLinks     int      `json:"min_primary_links"`
	Whitelist           []string `json:"whitelist"`
	Blacklist           []string `json:"blacklist"`
}

func LoadPolicy(path string) (Policy, error) {
	b, err := os.ReadFile(path)
	if err != nil {
		return Policy{}, err
	}
	var p Policy
	if err := json.Unmarshal(b, &p); err != nil {
		return Policy{}, err
	}
	return p, nil
}

// AddToBlacklist adds an id to the policy blacklist and writes the file.
func AddToBlacklist(path string, id string) error {
	p, err := LoadPolicy(path)
	if err != nil {
		return err
	}
	for _, b := range p.Blacklist {
		if b == id {
			return nil // already present
		}
	}
	p.Blacklist = append(p.Blacklist, id)
	b, err := json.MarshalIndent(p, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, b, 0644)
}

// RemoveFromBlacklist removes an id from the blacklist and writes the file.
func RemoveFromBlacklist(path string, id string) error {
	p, err := LoadPolicy(path)
	if err != nil {
		return err
	}
	newBl := []string{}
	for _, b := range p.Blacklist {
		if b != id {
			newBl = append(newBl, b)
		}
	}
	p.Blacklist = newBl
	b, err := json.MarshalIndent(p, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, b, 0644)
}

func init() {
	// simple CLI integration for policy management
	if len(os.Args) >= 3 && os.Args[1] == "policy" {
		sub := os.Args[2]
		if sub == "add-blacklist" && len(os.Args) == 4 {
			if err := AddToBlacklist("data/sources/policy.json", os.Args[3]); err != nil {
				fmt.Fprintf(os.Stderr, "failed to add blacklist: %v\n", err)
				os.Exit(1)
			}
			fmt.Println("added to blacklist:", os.Args[3])
			os.Exit(0)
		}
		if sub == "remove-blacklist" && len(os.Args) == 4 {
			if err := RemoveFromBlacklist("data/sources/policy.json", os.Args[3]); err != nil {
				fmt.Fprintf(os.Stderr, "failed to remove blacklist: %v\n", err)
				os.Exit(1)
			}
			fmt.Println("removed from blacklist:", os.Args[3])
			os.Exit(0)
		}
		fmt.Fprintln(os.Stderr, "usage: policy add-blacklist <id> | policy remove-blacklist <id>")
		os.Exit(2)
	}
}

// SelectEvidenceSources returns a filtered list of sources according to the policy.
// - Whitelist entries are always included.
// - Blacklist entries are always excluded.
// - Otherwise, sources must meet the numeric thresholds (trust_score, concordance, primary links).
func SelectEvidenceSources(srcs []Source, p Policy) []Source {
	out := []Source{}
	black := map[string]bool{}
	for _, id := range p.Blacklist {
		black[id] = true
	}
	white := map[string]bool{}
	for _, id := range p.Whitelist {
		white[id] = true
	}
	for _, s := range srcs {
		if black[s.ID] {
			continue
		}
		if white[s.ID] {
			out = append(out, s)
			continue
		}
		if s.TrustScore >= p.MinTrustScore && s.Indicators.ConcordanceScore >= p.MinConcordanceScore && s.Indicators.PrimaryLinks >= p.MinPrimaryLinks {
			out = append(out, s)
		}
	}
	return out
}
