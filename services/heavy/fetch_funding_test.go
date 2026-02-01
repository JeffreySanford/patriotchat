package main

import (
	"os"
	"testing"
)

func TestSeedFundingSignals(t *testing.T) {
	// enable DEV_STUBS to simulate provider results
	os.Setenv("DEV_STUBS", "1")
	defer os.Unsetenv("DEV_STUBS")

	// ensure proposals file exists in known state
	if err := SeedFundingSignals(); err != nil {
		t.Fatalf("SeedFundingSignals failed: %v", err)
	}
	srcs, err := LoadRegistry()
	if err != nil {
		t.Fatalf("failed to load registry: %v", err)
	}
	for _, s := range srcs {
		if s.FundingSignals.OwnerDonations == nil {
			t.Fatalf("expected owner_donations for %s to be set", s.ID)
		}
		if len(s.AuditLog) == 0 {
			t.Fatalf("expected audit log entry for %s", s.ID)
		}
	}
}
