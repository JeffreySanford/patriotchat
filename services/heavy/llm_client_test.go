package main

import (
	"strings"
	"testing"
)

func TestBuildEvidenceInstruction(t *testing.T) {
	instr := buildEvidenceInstruction()
	if instr == "" {
		t.Fatalf("expected non-empty instruction")
	}
	// check that ap (whitelisted) appears and splc/bbc do not
	if !strings.Contains(instr, "ap:") {
		t.Errorf("ap should be present in instruction: %s", instr)
	}
	// blacklisted sources should NOT be present in the approved sources list
	if strings.Contains(instr, "- splc:") || strings.Contains(instr, "- bbc:") {
		t.Errorf("blacklisted source found in approved list: %s", instr)
	}
	// but the instruction should explicitly mention the blacklist to warn the model
	if !strings.Contains(instr, "Do NOT use these blacklisted sources") {
		t.Errorf("instruction should include blacklist warning: %s", instr)
	}
	if !strings.Contains(instr, "splc") || !strings.Contains(instr, "bbc") {
		t.Errorf("blacklist should be listed in the instruction: %s", instr)
	}
}
