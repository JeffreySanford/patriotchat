package main

import (
	"bufio"
	"encoding/json"
	"os"
	"testing"
)

func TestPolicyAuditLogWritten(t *testing.T) {
	// ensure a fresh file
	path := "data/sources/policy_audit.log"
	_ = os.Remove(path)
	_ = buildEvidenceInstruction()
	f, err := os.Open(path)
	if err != nil {
		t.Fatalf("policy audit log not written: %v", err)
	}
	defer f.Close()
	s := bufio.NewScanner(f)
	last := ""
	for s.Scan() {
		last = s.Text()
	}
	if last == "" {
		t.Fatalf("policy audit file empty")
	}
	var a PolicyAudit
	if err := json.Unmarshal([]byte(last), &a); err != nil {
		t.Fatalf("failed to parse audit entry: %v", err)
	}
	// expect ap to be included, and splc to be in the excluded list
	foundAP := false
	for _, id := range a.Included {
		if id == "ap" {
			foundAP = true
		}
	}
	if !foundAP {
		t.Errorf("ap should be included in audit: %+v", a)
	}
	foundSPLC := false
	for _, id := range a.Excluded {
		if id == "splc" {
			foundSPLC = true
		}
	}
	if !foundSPLC {
		t.Errorf("splc should be listed in excluded blacklist: %+v", a)
	}
}
