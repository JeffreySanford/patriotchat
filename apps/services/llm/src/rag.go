package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type Document struct {
	ID         string
	Source     string
	SourceType string
	ChunkIndex int
	Text       string
	Lower      string
}

type RetrievedDocMetadata struct {
	DocumentID string `json:"document_id"`
	Source     string `json:"source"`
	SourceType string `json:"source_type"`
	ChunkIndex int    `json:"chunk_index"`
}

type RetrievalMetadata struct {
	PromptHash string                 `json:"prompt_hash"`
	Timestamp  time.Time              `json:"timestamp"`
	Documents  []RetrievedDocMetadata `json:"documents"`
}

var (
	ragDocs []Document
	ragMu   sync.Mutex
)

func initRagIndex() error {
	dir := ragDataDir()

	info, err := os.Stat(dir)
	if err != nil {
		return fmt.Errorf("rag data dir not accessible (%s): %w", dir, err)
	}
	if !info.IsDir() {
		return fmt.Errorf("rag data path is not a directory: %s", dir)
	}

	entries, err := os.ReadDir(dir)
	if err != nil {
		return fmt.Errorf("reading rag directory: %w", err)
	}

	var docs []Document
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		path := filepath.Join(dir, entry.Name())
		data, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		chunks := chunkText(string(data))
		for idx, chunk := range chunks {
			doc := Document{
				ID:         fmt.Sprintf("%s-%d", entry.Name(), idx),
				Source:     entry.Name(),
				SourceType: determineSourceType(entry.Name()),
				ChunkIndex: idx,
				Text:       chunk,
				Lower:      strings.ToLower(chunk),
			}
			docs = append(docs, doc)
		}
	}

	ragMu.Lock()
	ragDocs = docs
	ragMu.Unlock()
	return nil
}

func ragDataDir() string {
	if override := os.Getenv("PRO_LIBERTY_RAG_DATA_DIR"); override != "" {
		return override
	}
	return filepath.Join("..", "..", "data", "founding")
}

func chunkText(text string) []string {
	var chunks []string
	for _, part := range strings.Split(text, "\n\n") {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		chunks = append(chunks, part)
	}
	return chunks
}

func determineSourceType(name string) string {
	lower := strings.ToLower(name)
	switch {
	case strings.Contains(lower, "federalist"),
		strings.Contains(lower, "constitution"),
		strings.Contains(lower, "anti"),
		strings.Contains(lower, "brutus"):
		return "founding_core"
	default:
		return "founding_general"
	}
}

func retrieveContext(prompt string, limit int) []Document {
	ragMu.Lock()
	docs := append([]Document(nil), ragDocs...)
	ragMu.Unlock()

	prompt = strings.TrimSpace(prompt)
	if len(docs) == 0 || prompt == "" || limit <= 0 {
		return nil
	}

	type scoredDoc struct {
		doc   Document
		score int
	}
	var scored []scoredDoc
	for _, doc := range docs {
		score := scoreDocument(prompt, doc)
		scored = append(scored, scoredDoc{doc: doc, score: score})
	}

	sort.Slice(scored, func(i, j int) bool {
		if scored[i].score == scored[j].score {
			return scored[i].doc.ChunkIndex < scored[j].doc.ChunkIndex
		}
		return scored[i].score > scored[j].score
	})

	var results []Document
	for i := 0; i < len(scored) && len(results) < limit; i++ {
		results = append(results, scored[i].doc)
	}
	return results
}

func scoreDocument(prompt string, doc Document) int {
	tokens := map[string]struct{}{}
	for _, word := range strings.Fields(strings.ToLower(prompt)) {
		token := strings.Trim(word, ".,;:\"'()[]{}")
		if len(token) < 3 {
			continue
		}
		tokens[token] = struct{}{}
	}
	if len(tokens) == 0 {
		return 0
	}

	score := 0
	for token := range tokens {
		if strings.Contains(doc.Lower, token) {
			score++
		}
	}
	return score
}

func logRetrievalMetadata(prompt string, retrieved []Document) {
	if len(retrieved) == 0 {
		return
	}

	meta := RetrievalMetadata{
		PromptHash: hashPrompt(prompt),
		Timestamp:  time.Now().UTC(),
	}
	for _, doc := range retrieved {
		meta.Documents = append(meta.Documents, RetrievedDocMetadata{
			DocumentID: doc.ID,
			Source:     doc.Source,
			SourceType: doc.SourceType,
			ChunkIndex: doc.ChunkIndex,
		})
	}

	buf, err := json.Marshal(meta)
	if err != nil {
		return
	}

	path := filepath.Join("logs", "rag_retrieval.jsonl")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return
	}
	f, err := os.OpenFile(path, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return
	}
	defer f.Close()
	f.Write(buf)
	f.Write([]byte("\n"))
}

func hashPrompt(prompt string) string {
	sum := sha256.Sum256([]byte(prompt))
	return hex.EncodeToString(sum[:])
}

func buildRetrievalContext(existing string, docs []Document) string {
	var builder strings.Builder
	if existing != "" {
		builder.WriteString(existing)
		builder.WriteString("\n\n")
	}
	builder.WriteString("Constitution-first context (founding docs prioritized):\n")
	for _, doc := range docs {
		snippet := doc.Text
		if len(snippet) > 320 {
			snippet = snippet[:320] + "..."
		}
		builder.WriteString(fmt.Sprintf("- %s chunk %d (%s): %s\n", doc.Source, doc.ChunkIndex, doc.SourceType, snippet))
	}
	return builder.String()
}
