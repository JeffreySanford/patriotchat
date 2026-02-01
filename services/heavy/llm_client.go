package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	systemPrompt = `You are a neutral fact-based assistant. Provide output ONLY as a JSON array of objects with fields: "claim" (short factual sentence), "sources" (array of URLs), "timestamp" (ISO8601 if available), and "attribution" (optional - who made any normative claim).

Structure and rules:
- Answer in two logical sections within the JSON array: first the Facts section (one or more factual claim objects), then one or more Interpretation objects. Maintain this ordering in the returned array.
- Facts: list only factual statements supported by sources. Prefer primary sources first (government sites, official reports, transcripts). Each fact must include at least one source URL. Avoid loaded adjectives, moralizing language, or mind-reading motives in factual claims.
- Interpretation: label any interpretive or opinion content via the "attribution" field (for example, "Attribution": "OPINION" or the named source of the opinion). Interpretation entries must be clearly distinguished from factual claims and may include sources that support the interpretation. Keep interpretations concise and explicitly marked as opinion.
- If sources conflict, present both sides in the Facts (include the differing source URLs) and in the Interpretation clearly state what is disputed and by whom.
- Each entry in the sources array must be a fully qualified URL that begins with http:// or https://; do not provide bare hostnames or ID prefixes.
- Do not invent sources. Do not use un-attributed normative language. If you cannot find reliable primary sources for a factual claim, say so and avoid asserting the claim as fact.`
	defaultModel = "llama2"
	defaultHost  = "localhost"
	defaultPort  = "11434"
)

type ollamaChatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type ollamaChatRequest struct {
	Model       string              `json:"model"`
	Messages    []ollamaChatMessage `json:"messages"`
	MaxTokens   int                 `json:"max_tokens,omitempty"`
	Temperature float64             `json:"temperature,omitempty"`
}

func getEnvOrDefault(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// NeutralChat calls Ollama with enforced system prompt and returns assistant content.
func NeutralChat(userPrompt string) (string, error) {
	host := getEnvOrDefault("OLLAMA_HOST", defaultHost)
	port := getEnvOrDefault("OLLAMA_PORT", defaultPort)
	baseURL := fmt.Sprintf("http://%s:%s", host, port)
	url := fmt.Sprintf("%s/v1/chat/completions", baseURL)

	reqBody := ollamaChatRequest{
		Model: getEnvOrDefault("OLLAMA_MODEL", defaultModel),
		Messages: []ollamaChatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		MaxTokens:   600,
		Temperature: 0.0,
	}
	b, _ := json.Marshal(reqBody)

	// log request for diagnostics
	_ = AppendLLMRequestLog("data/sources/llm_requests.log", reqBody.Messages[1].Content)

	client := &http.Client{Timeout: 60 * time.Second}
	start := time.Now()
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(b))
	if err != nil {
		// log failed request
		_ = AppendLLMResponseDetailed("data/sources/llm_responses.log", "", "request_error", time.Since(start).Milliseconds())
		return "", err
	}
	lat := time.Since(start).Milliseconds()
	defer resp.Body.Close()

	// read full response body for improved diagnostics (works for both ok and non-200)
	bodyBytes, _ := io.ReadAll(resp.Body)
	bodyStr := string(bodyBytes)

	var raw map[string]any

	if resp.StatusCode != http.StatusOK {
		_ = AppendLLMResponseDetailed("data/sources/llm_responses.log", bodyStr, fmt.Sprintf("status_%d", resp.StatusCode), lat)
		// If Ollama reports the model wasn't found, attempt to discover an available model and retry once.
		var errObj struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		_ = json.Unmarshal(bodyBytes, &errObj)
		if strings.Contains(errObj.Error.Message, "not found") {
			// discover models
			modelsURL := fmt.Sprintf("%s/v1/models", baseURL)
			resp2, err2 := http.Get(modelsURL)
			if err2 == nil {
				defer resp2.Body.Close()
				mb, _ := io.ReadAll(resp2.Body)
				var modelsRaw map[string]any
				if json.Unmarshal(mb, &modelsRaw) == nil {
					if data, ok := modelsRaw["data"].([]any); ok && len(data) > 0 {
						if first, ok := data[0].(map[string]any); ok {
							if mid, ok := first["id"].(string); ok && mid != "" {
								// retry with discovered model
								reqBody.Model = mid
								rb, _ := json.Marshal(reqBody)
								start2 := time.Now()
								resp3, err3 := client.Post(url, "application/json", bytes.NewBuffer(rb))
								if err3 != nil {
									return "", err3
								}
								defer resp3.Body.Close()
								lat3 := time.Since(start2).Milliseconds()
								b3, _ := io.ReadAll(resp3.Body)
								if resp3.StatusCode != http.StatusOK {
									_ = AppendLLMResponseDetailed("data/sources/llm_responses.log", string(b3), fmt.Sprintf("status_%d", resp3.StatusCode), lat3)
									return "", fmt.Errorf("ollama returned status %d on retry: %s", resp3.StatusCode, string(b3))
								}
								if err := json.Unmarshal(b3, &raw); err != nil {
									_ = AppendLLMResponseDetailed("data/sources/llm_responses.log", string(b3), "decode_error", lat3)
									return "", err
								}
								_ = AppendLLMResponseDetailed("data/sources/llm_responses.log", "(decoded) "+string(b3), "ok", lat3)
							}
						}
					}
				}
			}
		}
		return "", fmt.Errorf("ollama returned status %d: %s", resp.StatusCode, bodyStr)
	}

	if err := json.Unmarshal(bodyBytes, &raw); err != nil {
		_ = AppendLLMResponseDetailed("data/sources/llm_responses.log", bodyStr, "decode_error", lat)
		return "", err
	}
	_ = AppendLLMResponseDetailed("data/sources/llm_responses.log", "(decoded) "+bodyStr, "ok", lat)

	// navigate to choices[0].message.content
	choices, ok := raw["choices"].([]any)
	if !ok || len(choices) == 0 {
		return "", errors.New("no choices in response")
	}
	first, ok := choices[0].(map[string]any)
	if !ok {
		return "", errors.New("invalid choice format")
	}
	msg, ok := first["message"].(map[string]any)
	if !ok {
		// some endpoints return text directly under "text" or "content"
		if t, ok := first["text"].(string); ok {
			return t, nil
		}
		return "", errors.New("no message field in choice")
	}
	content, _ := msg["content"].(string)
	return content, nil
}

// buildEvidenceInstruction loads the policy and registry and returns a short instruction
// telling the LLM which sources are approved for evidence and which are blacklisted.
func buildEvidenceInstruction() string {
	p, err := LoadPolicy("data/sources/policy.json")
	if err != nil {
		return "" // if policy unavailable, don't restrict sources here
	}
	srcs, err := LoadRegistry()
	if err != nil {
		return ""
	}
	selected := SelectEvidenceSources(srcs, p)
	// audit the decision: included IDs and blacklisted/excluded IDs
	includedIDs := []string{}
	for _, s := range selected {
		includedIDs = append(includedIDs, s.ID)
	}
	excludedIDs := p.Blacklist
	// attempt best-effort write to audit log (ignore errors for runtime path)
	_ = AppendPolicyAuditLog("data/sources/policy_audit.log", includedIDs, excludedIDs)

	if len(selected) == 0 {
		return ""
	}
	lines := "Only use the following approved sources for evidence (ID:url):\n"
	for _, s := range selected {
		lines += fmt.Sprintf("- %s:%s\n", s.ID, s.URL)
	}
	if len(p.Blacklist) > 0 {
		lines += "Do NOT use these blacklisted sources: " + fmt.Sprint(p.Blacklist) + "\n"
	}
	return lines
}

// QueryWithRetries calls NeutralChat and validates the output; on failure it retries with corrective instruction.
func QueryWithRetries(userPrompt string, attempts int) (string, error) {
	// augment prompt with approved sources instruction
	instr := buildEvidenceInstruction()
	if instr != "" {
		userPrompt = instr + "\n" + userPrompt
	}

	var lastErr error
	for i := 0; i < attempts; i++ {
		content, err := NeutralChat(userPrompt)
		if err != nil {
			lastErr = err
			continue
		}

		// audit raw assistant response for review
		_ = AppendLLMResponseLog("data/sources/llm_responses.log", content)
		if err := ValidateLLMOutput(content); err != nil {
			lastErr = err
			// build corrective prompt
			corrective := fmt.Sprintf("Previous response failed validation: %s. Please respond ONLY with the requested JSON array following the system schema exactly.", err.Error())
			userPrompt = corrective + "\n" + instr + "\n" + userPrompt
			continue
		}
		return content, nil
	}
	if lastErr == nil {
		lastErr = errors.New("unknown validation failure")
	}
	return "", fmt.Errorf("failed after %d attempts: %w", attempts, lastErr)
}
