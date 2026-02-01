package main

import (
	"encoding/json"
	"os"
	"time"
)

type PolicyAudit struct {
	Time     string   `json:"time"`
	Included []string `json:"included"`
	Excluded []string `json:"excluded"`
	Reason   string   `json:"reason"`
}

func AppendPolicyAuditLog(path string, included, excluded []string) error {
	a := PolicyAudit{
		Time:     time.Now().UTC().Format(time.RFC3339),
		Included: included,
		Excluded: excluded,
		Reason:   "Selected evidence sources for LLM prompt",
	}
	b, err := json.Marshal(a)
	if err != nil {
		return err
	}
	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = f.Write(append(b, '\n'))
	return err
}
