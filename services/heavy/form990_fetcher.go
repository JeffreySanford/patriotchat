package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
)

// Form990Result is a simple struct for totals
type Form990Result struct {
	D_total float64
	R_total float64
}

// FetchFromForm990 reads local Form-990 data from FORM990_DATA_PATH if set, otherwise returns stub.
// It attempts to find files matching the org id and sum any donor contributions labeled D/R.
func FetchFromForm990(org string) (Form990Result, EvidenceLink, error) {
	// Dev stubs
	if os.Getenv("DEV_STUBS") == "1" {
		d := 300.0 + float64(len(org))*7.0
		r := 150.0 + float64(len(org))*3.0
		return Form990Result{D_total: d, R_total: r}, EvidenceLink{URL: "", Type: "dev_stub", Excerpt: "DEV_STUBS enabled: synthetic funding data"}, nil
	}

	dataPath := os.Getenv("FORM990_DATA_PATH")
	if dataPath == "" {
		return Form990Result{D_total: 0.0, R_total: 0.0}, EvidenceLink{URL: "", Type: "stub", Excerpt: "FORM990_DATA_PATH not configured; stubbed result"}, nil
	}
	// look for a file that contains the org id in its name
	files, err := ioutil.ReadDir(dataPath)
	if err != nil {
		return Form990Result{}, EvidenceLink{}, fmt.Errorf("failed to read form990 data dir: %v", err)
	}
	for _, f := range files {
		if f.IsDir() {
			continue
		}
		if filepath.Ext(f.Name()) == ".json" && containsIgnoreCase(f.Name(), org) {
			b, err := os.ReadFile(filepath.Join(dataPath, f.Name()))
			if err != nil {
				return Form990Result{}, EvidenceLink{}, fmt.Errorf("failed to read file: %v", err)
			}
			// try to parse simple structure {"donations": [{"party":"D","amount":123.45}, ...]}
			var doc struct {
				Donations []struct {
					Party  string  `json:"party"`
					Amount float64 `json:"amount"`
				} `json:"donations"`
			}
			if err := json.Unmarshal(b, &doc); err != nil {
				return Form990Result{}, EvidenceLink{}, fmt.Errorf("failed to parse json: %v", err)
			}
			res := Form990Result{}
			for _, d := range doc.Donations {
				switch d.Party {
				case "D":
					res.D_total += d.Amount
				case "R":
					res.R_total += d.Amount
				}
			}
			return res, EvidenceLink{URL: filepath.Join(dataPath, f.Name()), Type: "form990", Excerpt: "parsed local Form-990 donations"}, nil
		}
	}
	return Form990Result{D_total: 0.0, R_total: 0.0}, EvidenceLink{URL: "", Type: "stub", Excerpt: "no Form-990 file found for org; stubbed result"}, nil
}

func containsIgnoreCase(s, sub string) bool {
	return filepath.Base(s) == s && (len(s) >= len(sub) && stringsContainsIgnoreCase(s, sub))
}

// naive case-insensitive contains
func stringsContainsIgnoreCase(s, sub string) bool {
	S := strings.ToLower(s)
	subS := strings.ToLower(sub)
	return strings.Contains(S, subS)
}
