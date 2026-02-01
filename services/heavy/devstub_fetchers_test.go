package main

import (
	"os"
	"testing"
)

func TestFetchersDevStubs(t *testing.T) {
	os.Setenv("DEV_STUBS", "1")
	defer os.Unsetenv("DEV_STUBS")

	fecRes, fecE, err := FetchFromFEC("nyt")
	if err != nil {
		t.Fatalf("FetchFromFEC error: %v", err)
	}
	if fecE.Type != "dev_stub" || fecRes.D_total == 0 {
		t.Fatalf("expected dev_stub for FEC, got %v and %v", fecE, fecRes)
	}

	ftmRes, ftmE, err := FetchFromFollowTheMoney("nyt")
	if err != nil {
		t.Fatalf("FetchFromFollowTheMoney error: %v", err)
	}
	if ftmE.Type != "dev_stub" || ftmRes.D_total == 0 {
		t.Fatalf("expected dev_stub for FTM, got %v and %v", ftmE, ftmRes)
	}

	ocRes, ocE, err := FetchFromOpenCorporates("nyt")
	if err != nil {
		t.Fatalf("FetchFromOpenCorporates error: %v", err)
	}
	if ocE.Type != "dev_stub" || ocRes.D_total == 0 {
		t.Fatalf("expected dev_stub for OC, got %v and %v", ocE, ocRes)
	}

	fRes, fE, err := FetchFromForm990("nyt")
	if err != nil {
		t.Fatalf("FetchFromForm990 error: %v", err)
	}
	if fE.Type != "dev_stub" || fRes.D_total == 0 {
		t.Fatalf("expected dev_stub for Form990, got %v and %v", fE, fRes)
	}
}
