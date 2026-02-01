package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestLoadRegistry(t *testing.T) {
	srcs, err := LoadRegistry()
	if err != nil {
		t.Fatalf("failed to load registry: %v", err)
	}
	if len(srcs) == 0 {
		t.Fatal("expected at least one source in registry")
	}
}

func TestComputeTrustScore(t *testing.T) {
	ind := Indicators{PrimaryLinks: 4, CorrectionRate: 0.02, ConcordanceScore: 0.9}
	score := ComputeTrustScore(ind)
	if score <= 0 || score > 1 {
		t.Fatalf("unexpected score: %v", score)
	}
}

func TestListSourcesHandler(t *testing.T) {
	req := httptest.NewRequest("GET", "/sources", nil)
	w := httptest.NewRecorder()
	listSourcesHandler(w, req)
	res := w.Result()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.StatusCode)
	}
	var srcs []Source
	if err := json.NewDecoder(res.Body).Decode(&srcs); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if len(srcs) == 0 {
		t.Fatal("expected sources in response")
	}
}

func TestComputeScoreHandler(t *testing.T) {
	// pick first source id
	srcs, _ := LoadRegistry()
	id := srcs[0].ID
	req := httptest.NewRequest("GET", "/sources/"+id+"/compute", nil)
	w := httptest.NewRecorder()
	computeScoreHandler(w, req)
	res := w.Result()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.StatusCode)
	}
	var out map[string]any
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if out["id"] != id {
		t.Fatalf("expected id %s, got %v", id, out["id"])
	}
}

func TestComputeLeaningHandler(t *testing.T) {
	srcs, _ := LoadRegistry()
	id := srcs[0].ID
	req := httptest.NewRequest("GET", "/sources/"+id+"/compute-leaning", nil)
	w := httptest.NewRecorder()
	computeLeaningHandler(w, req)
	res := w.Result()
	if res.StatusCode != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.StatusCode)
	}
	var out map[string]any
	if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if out["id"] != id {
		t.Fatalf("expected id %s, got %v", id, out["id"])
	}
	if _, ok := out["computed_leaning"]; !ok {
		t.Fatalf("expected computed_leaning in response")
	}
}

func TestProposeAndApprove(t *testing.T) {
	// Clean proposals file for test
	os.Remove(proposalsPath)
	p := Proposal{ID: "nyt", NewScore: 0.3, Rationale: "test change", Proposer: "tester"}
	b, _ := json.Marshal(p)
	req := httptest.NewRequest("POST", "/sources/propose", jsonBody(b))
	w := httptest.NewRecorder()
	proposeRatingHandler(w, req)
	res := w.Result()
	if res.StatusCode != http.StatusAccepted {
		t.Fatalf("expected 202, got %d", res.StatusCode)
	}
	// approve
	req2 := httptest.NewRequest("POST", "/sources/nyt/approve", nil)
	req2.Header.Set("X-Reviewer", "admin")
	w2 := httptest.NewRecorder()
	approveRatingHandler(w2, req2)
	res2 := w2.Result()
	if res2.StatusCode != http.StatusOK {
		t.Fatalf("expected 200 on approve, got %d", res2.StatusCode)
	}
}

// helper for json body
func jsonBody(b []byte) *os.File {
	f, _ := os.CreateTemp("", "jsonbody")
	f.Write(b)
	f.Seek(0, 0)
	return f
}
