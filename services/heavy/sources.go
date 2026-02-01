package main

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"path"
	"strings"
	"time"
)

const registryPath = "data/sources/registry.json"
const proposalsPath = "data/sources/proposals.json"

// Source represents a media/source entry in the registry.
type Source struct {
	ID               string           `json:"id"`
	Name             string           `json:"name"`
	URL              string           `json:"url"`
	TrustScore       float64          `json:"trust_score"`
	PoliticalLeaning string           `json:"political_leaning"`
	LeaningScore     float64          `json:"leaning_score,omitempty"`
	Indicators       Indicators       `json:"indicators"`
	FundingSignals   FundingSignals   `json:"funding_signals,omitempty"`
	ExternalRatings  []ExternalRating `json:"external_ratings,omitempty"`
	EvidenceLinks    []EvidenceLink   `json:"evidence_links,omitempty"`
	AuditLog         []AuditEntry     `json:"audit_log,omitempty"`
	LastReviewed     string           `json:"last_reviewed"`
	Reviewers        []string         `json:"reviewers"`
	// EditorialNotes are reviewer guidance only and MUST NOT be used as evidence
	// or cited in LLM prompts. Use primary sources and indicators instead.
	EditorialNotes []string `json:"editorial_notes,omitempty"`
}

type FundingSignals struct {
	OwnerDonations map[string]float64 `json:"owner_donations,omitempty"`
}

type ExternalRating struct {
	Source string `json:"source"`
	Rating string `json:"rating"`
}

type EvidenceLink struct {
	URL     string `json:"url"`
	Type    string `json:"type"`
	Excerpt string `json:"excerpt,omitempty"`
}

type AuditEntry struct {
	Time   string `json:"time"`
	Actor  string `json:"actor"`
	Action string `json:"action"`
	Notes  string `json:"notes,omitempty"`
}

type Indicators struct {
	PrimaryLinks     int     `json:"primary_links"`
	CorrectionRate   float64 `json:"correction_rate"`
	ConcordanceScore float64 `json:"concordance_score"`
}

// Proposal represents a proposed rating change.
type Proposal struct {
	ID            string          `json:"id"`
	NewScore      float64         `json:"new_score,omitempty"`
	Rationale     string          `json:"rationale"`
	Proposer      string          `json:"proposer"`
	Time          string          `json:"time"`
	Approved      bool            `json:"approved"`
	Reviewer      string          `json:"reviewer,omitempty"`
	Funding       *FundingSignals `json:"funding,omitempty"`
	EvidenceLinks []EvidenceLink  `json:"evidence_links,omitempty"`
	ProvidersUsed []string        `json:"providers_used,omitempty"`
	ProviderStubs []string        `json:"provider_stubs,omitempty"`
}

// LoadRegistry reads the registry JSON file.
func LoadRegistry() ([]Source, error) {
	f, err := os.Open(registryPath)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	b, err := io.ReadAll(f)
	if err != nil {
		return nil, err
	}
	var srcs []Source
	if err := json.Unmarshal(b, &srcs); err != nil {
		return nil, err
	}
	return srcs, nil
}

// writeRegistry writes the registry back to disk.
func writeRegistry(srcs []Source) error {
	b, err := json.MarshalIndent(srcs, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(registryPath, b, 0644)
}

// ComputeTrustScore computes a trust score from indicators.
func ComputeTrustScore(ind Indicators) float64 {
	// Normalize primary links (assume 0-6, cap at 6)
	primaryNorm := float64(ind.PrimaryLinks)
	if primaryNorm > 6 {
		primaryNorm = 6
	}
	primaryScore := primaryNorm / 6.0 // 0..1

	concord := ind.ConcordanceScore // assume 0..1
	correctionPenalty := 1.0 - ind.CorrectionRate

	// weights: primary 50%, concordance 30%, correction 20%
	score := 0.5*primaryScore + 0.3*concord + 0.2*correctionPenalty
	if score < 0 {
		score = 0
	}
	if score > 1 {
		score = 1
	}
	return score
}

// ComputeLeaningScore computes a numeric leaning score in range -1.0 (left) .. +1.0 (right).
func ComputeLeaningScore(s Source) float64 {
	// Base from political_leaning string
	base := 0.0
	switch strings.ToLower(s.PoliticalLeaning) {
	case "far-left":
		base = -0.9
	case "left":
		base = -0.7
	case "center-left":
		base = -0.5
	case "center":
		base = 0.0
	case "center-right":
		base = 0.5
	case "right":
		base = 0.7
	case "far-right":
		base = 0.9
	default:
		base = 0.0
	}

	// incorporate external ratings if present
	if len(s.ExternalRatings) > 0 {
		sum := 0.0
		count := 0.0
		for _, er := range s.ExternalRatings {
			r := strings.ToLower(er.Rating)
			val := 0.0
			switch r {
			case "left":
				val = -0.6
			case "lean left":
				val = -0.3
			case "center":
				val = 0.0
			case "lean right":
				val = 0.3
			case "right":
				val = 0.6
			default:
				val = 0.0
			}
			sum += val
			count += 1.0
		}
		extAvg := sum / count
		// weight: base 60%, external 40%
		res := 0.6*base + 0.4*extAvg
		if res < -1 {
			res = -1
		}
		if res > 1 {
			res = 1
		}
		return res
	}

	// default: return base
	return base
}

// HTTP handlers

// listSourcesHandler returns the registry as JSON.
func listSourcesHandler(w http.ResponseWriter, _ *http.Request) {
	srcs, err := LoadRegistry()
	if err != nil {
		http.Error(w, "failed to load registry", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(srcs)
}

// proposeRatingHandler accepts a proposal and appends it to proposals file.
func proposeRatingHandler(w http.ResponseWriter, r *http.Request) {
	var p Proposal
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	p.Time = time.Now().UTC().Format(time.RFC3339)
	p.Approved = false
	// ensure proposals dir exists
	dir := path.Dir(proposalsPath)
	os.MkdirAll(dir, 0755)
	var props []Proposal
	if _, err := os.Stat(proposalsPath); err == nil {
		b, _ := os.ReadFile(proposalsPath)
		json.Unmarshal(b, &props)
	}
	props = append(props, p)
	b, _ := json.MarshalIndent(props, "", "  ")
	os.WriteFile(proposalsPath, b, 0644)
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{"status": "proposal received"})
}

// approveRatingHandler approves a proposal and updates the registry. Requires X-Reviewer header.
func approveRatingHandler(w http.ResponseWriter, r *http.Request) {
	reviewer := r.Header.Get("X-Reviewer")
	if reviewer == "" {
		http.Error(w, "missing reviewer header", http.StatusUnauthorized)
		return
	}
	id := strings.TrimPrefix(r.URL.Path, "/sources/")
	id = strings.TrimSuffix(id, "/approve")
	if id == "" {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	// find proposal
	var props []Proposal
	if _, err := os.Stat(proposalsPath); err != nil {
		http.Error(w, "no proposals", http.StatusNotFound)
		return
	}
	b, _ := os.ReadFile(proposalsPath)
	json.Unmarshal(b, &props)
	var foundIndex = -1
	for i, p := range props {
		if p.ID == id && !p.Approved {
			foundIndex = i
			break
		}
	}
	if foundIndex == -1 {
		http.Error(w, "proposal not found", http.StatusNotFound)
		return
	}
	props[foundIndex].Approved = true
	props[foundIndex].Reviewer = reviewer
	// update registry
	srcs, err := LoadRegistry()
	if err != nil {
		http.Error(w, "failed to load registry", http.StatusInternalServerError)
		return
	}
	for i, s := range srcs {
		if s.ID == id {
			srcs[i].TrustScore = props[foundIndex].NewScore
			srcs[i].LastReviewed = time.Now().UTC().Format("2006-01-02")
			srcs[i].Reviewers = append(srcs[i].Reviewers, reviewer)
			// write registry and proposals
			writeRegistry(srcs)
			b2, _ := json.MarshalIndent(props, "", "  ")
			os.WriteFile(proposalsPath, b2, 0644)
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"status": "approved"})
			return
		}
	}
	http.Error(w, "source not found in registry", http.StatusNotFound)
}

// computeScoreHandler returns computed score from indicators for a given source id.
func computeScoreHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/sources/")
	id = strings.TrimSuffix(id, "/compute")
	if id == "" {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	srcs, err := LoadRegistry()
	if err != nil {
		http.Error(w, "failed to load registry", http.StatusInternalServerError)
		return
	}
	for _, s := range srcs {
		if s.ID == id {
			score := ComputeTrustScore(s.Indicators)
			json.NewEncoder(w).Encode(map[string]any{"id": s.ID, "computed_score": score})
			return
		}
	}
	http.Error(w, "source not found", http.StatusNotFound)
}

// computeLeaningHandler computes the leaning score for a source id and returns it.
func computeLeaningHandler(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/sources/")
	id = strings.TrimSuffix(id, "/compute-leaning")
	if id == "" {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	srcs, err := LoadRegistry()
	if err != nil {
		http.Error(w, "failed to load registry", http.StatusInternalServerError)
		return
	}
	for i, s := range srcs {
		if s.ID == id {
			lean := ComputeLeaningScore(s)
			// update registry with computed value
			srcs[i].LeaningScore = lean
			writeRegistry(srcs)
			json.NewEncoder(w).Encode(map[string]any{"id": s.ID, "computed_leaning": lean})
			return
		}
	}
	http.Error(w, "source not found", http.StatusNotFound)
}
