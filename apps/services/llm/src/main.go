package main

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

const defaultModelID = "liberty-mistral-v1.0"

type ModelInfo struct {
	ID            string `json:"id"`
	Name          string `json:"name"`
	Description   string `json:"description,omitempty"`
	Provider      string `json:"provider,omitempty"`
	ContextWindow int    `json:"contextWindow,omitempty"`
}

var availableModels = []ModelInfo{
	{
		ID:            "liberty-mistral-v1.0",
		Name:          "Liberty Mistral v1.0",
		Description:   "Values-first constitutional reasoning with enumerated powers citations",
		Provider:      "local",
		ContextWindow: 8192,
	},
	{
		ID:            "mistral",
		Name:          "Mistral 7B Instruct (Ollama)",
		Description:   "General-styled Mistral instruct model",
		Provider:      "ollama-maintained",
		ContextWindow: 8192,
	},
	{
		ID:            "llama2",
		Name:          "Llama 2",
		Description:   "Ollama-hosted Llama 2 baseline",
		Provider:      "ollama",
		ContextWindow: 4096,
	},
	{
		ID:            "neural-chat",
		Name:          "Neural Chat",
		Description:   "Legacy Neural Chat endpoint",
		Provider:      "ollama",
		ContextWindow: 4096,
	},
}

type InferenceRequest struct {
	Prompt  string `json:"prompt"`
	Model   string `json:"model"`
	ModelID string `json:"modelId"`
	Context string `json:"context,omitempty"`
	UserID  string `json:"user_id"`
}

type InferenceResponse struct {
	Result    string    `json:"result"`
	Model     string    `json:"model"`
	Tokens    int       `json:"tokens"`
	Duration  string    `json:"duration"`
	CreatedAt time.Time `json:"created_at"`
}

type HealthResponse struct {
	Status  string    `json:"status"`
	Service string    `json:"service"`
	Time    time.Time `json:"time"`
}

type ReadyResponse struct {
	Status string `json:"status"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func init() {
	var err error
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "postgres"
	}
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "patriotchat"
	}

	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	db, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test connection
	err = db.Ping()
	if err != nil {
		log.Printf("Warning: Database connection test failed: %v", err)
	} else {
		log.Println("Database connection successful")
	}

	if err := initRagIndex(); err != nil {
		log.Printf("Warning: Constitution-first RAG index failed to initialize: %v", err)
	}
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4004"
	}

	http.HandleFunc("/health", handleHealth)
	http.HandleFunc("/ready", handleReady)
	http.HandleFunc("/inference/generate", handleGenerate)
	http.HandleFunc("/inference/models", handleListModels)

	log.Printf("LLM Inference Service listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(HealthResponse{
		Status:  "ok",
		Service: "llm-service",
		Time:    time.Now().UTC(),
	})
}

func handleReady(w http.ResponseWriter, r *http.Request) {
	err := db.Ping()
	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Database unavailable"})
		return
	}

	// Check Ollama availability
	resp, err := http.Get("http://172.19.0.1:11434/api/tags")
	if err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Inference service unavailable (Ollama not accessible)"})
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ReadyResponse{Status: "ready"})
}

func handleGenerate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Method not allowed"})
		return
	}

	var req InferenceRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request body"})
		return
	}

	if req.Prompt == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "prompt is required"})
		return
	}

	modelID := req.ModelID
	if modelID == "" {
		modelID = req.Model
	}
	if modelID == "" {
		modelID = defaultModelID
	}

	// Add retrieval context for founding documents
	contexts := retrieveContext(req.Prompt, 3)
	if len(contexts) > 0 {
		req.Context = buildRetrievalContext(req.Context, contexts)
		logRetrievalMetadata(req.Prompt, contexts)
	}

	promptWithContext := req.Prompt
	if req.Context != "" {
		promptWithContext = req.Context + "\n\n" + req.Prompt
	}

	// Call Ollama
	start := time.Now()
	result, err := callOllama(modelID, promptWithContext)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: fmt.Sprintf("Inference failed: %v", err)})
		return
	}

	response := InferenceResponse{
		Result:    result,
		Model:     modelID,
		Tokens:    len(result) / 4, // Rough estimate
		Duration:  time.Since(start).String(),
		CreatedAt: time.Now().UTC(),
	}

	// Log to database (async)
	go logInference(req.UserID, modelID, req.Prompt, result)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleListModels(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Method not allowed"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"models": availableModels,
	})
}

func callOllama(model, prompt string) (string, error) {
	// Call Ollama directly - use gateway IP to reach host machine from container
	ollamaURL := "http://172.19.0.1:11434/api/generate"

	// Map model IDs to actual Ollama models
	modelMapping := map[string]string{
		"liberty-mistral-v1.0": "mistral:7b",
		"mistral":              "mistral:7b",
		"llama2":               "llama2",
		"neural-chat":          "codellama:7b", // fallback to codellama
	}

	actualModel := modelMapping[model]
	if actualModel == "" {
		actualModel = model // fallback to requested model name
	}

	payload := map[string]interface{}{
		"model":  actualModel,
		"prompt": prompt,
		"stream": false,
	}

	body, _ := json.Marshal(payload)
	resp, err := http.Post(ollamaURL, "application/json", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("ollama returned status %d", resp.StatusCode)
	}

	respBody, _ := io.ReadAll(resp.Body)
	var result map[string]interface{}
	json.Unmarshal(respBody, &result)

	if response, ok := result["response"].(string); ok {
		return response, nil
	}
	return "", fmt.Errorf("invalid response from Ollama")
}

func logInference(userID, model, prompt, result string) {
	// Placeholder for logging to database
	log.Printf("Inference: user=%s, model=%s, prompt_len=%d, result_len=%d",
		userID, model, len(prompt), len(result))
}
