package main

import (
	"encoding/json"
	"os"
	"time"
)

type LLMResponseLog struct {
	Time    string `json:"time"`
	Content string `json:"content"`
	Status  string `json:"status,omitempty"`
	Latency int64  `json:"latency_ms,omitempty"`
}

func AppendLLMResponseLog(path string, content string) error {
	entry := LLMResponseLog{
		Time:    time.Now().UTC().Format(time.RFC3339),
		Content: content,
	}
	b, err := json.Marshal(entry)
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

// AppendLLMResponseDetailed logs response with status and latency
func AppendLLMResponseDetailed(path string, content, status string, latencyMs int64) error {
	entry := LLMResponseLog{
		Time:    time.Now().UTC().Format(time.RFC3339),
		Content: content,
		Status:  status,
		Latency: latencyMs,
	}
	b, err := json.Marshal(entry)
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

// AppendLLMRequestLog logs an LLM request (truncates prompt to avoid huge logs)
func AppendLLMRequestLog(path string, prompt string) error {
	max := 2000
	if len(prompt) > max {
		prompt = prompt[:max] + "..."
	}
	entry := map[string]string{
		"time":   time.Now().UTC().Format(time.RFC3339),
		"prompt": prompt,
	}
	b, err := json.Marshal(entry)
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
