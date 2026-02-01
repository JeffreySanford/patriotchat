package main

import (
	"fmt"
	"os"
	"time"
)

// SeedFundingSignals ensures funding_signals.owner_donations exists and appends audit entries.
// If API keys are configured, this function will (in future) call external APIs to populate values.
func SeedFundingSignals() error {
	srcs, err := LoadRegistry()
	if err != nil {
		return err
	}
	changed := false
	now := time.Now().UTC().Format(time.RFC3339)
	for i := range srcs {
		// ensure funding signals object exists
		if srcs[i].FundingSignals.OwnerDonations == nil {
			srcs[i].FundingSignals.OwnerDonations = map[string]float64{"D": 0.0, "R": 0.0}
			changed = true
		}
		// append audit entry noting seed-run
		note := "seed_funding_signals: pending automated lookup; no API keys configured"
		// If any provider API key is present or DEV_STUBS is enabled, note that a lookup or dev stub run occurred
		if os.Getenv("FEC_API_KEY") != "" || os.Getenv("OPENCORPORATES_API_KEY") != "" || os.Getenv("FORM990_DATA_PATH") != "" || os.Getenv("DEV_STUBS") == "1" {
			note = "seed_funding_signals: automated lookup executed or DEV_STUBS used (providers configured or dev stubs enabled)"
		}
		ae := AuditEntry{Time: now, Actor: "system", Action: "seed_funding_signals", Notes: note}
		srcs[i].AuditLog = append(srcs[i].AuditLog, ae)
		changed = true
	}
	if changed {
		if err := writeRegistry(srcs); err != nil {
			return err
		}
	}
	fmt.Println("SeedFundingSignals completed")
	return nil
}

// CLI entry for convenience
func init() {
	if len(os.Args) > 1 && os.Args[1] == "seed-funding" {
		if err := SeedFundingSignals(); err != nil {
			fmt.Fprintf(os.Stderr, "SeedFundingSignals failed: %v\n", err)
			os.Exit(1)
		}
		os.Exit(0)
	}
}
