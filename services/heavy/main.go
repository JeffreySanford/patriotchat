package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func handler(w http.ResponseWriter, _ *http.Request) {
	fmt.Fprintf(w, "Hello from heavy service\n")
}

func allowCORS(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return true
	}
	return false
}

func tryFakeLLMResponse(w http.ResponseWriter, query string) bool {
	if os.Getenv("PATRIOTCHAT_FAKE_LLM") != "1" {
		return false
	}

	time.Sleep(1 * time.Second)

	response := fmt.Sprintf("Simulated LLM response for %q", query)
	fmt.Fprintf(os.Stderr, "LLM: fake response served for query %q\n", query)
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"response": %q}`, response)
	return true
}

func main() {
	// Determine port from --port flag or PORT env var, default to 4000
	portFlag := flag.String("port", "", "port to listen on")
	flag.Parse()
	port := "4000"
	if *portFlag != "" {
		port = *portFlag
	} else if env := os.Getenv("PORT"); env != "" {
		port = env
	}
	addr := ":" + port

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if allowCORS(w, r) {
			return
		}
		handler(w, r)
	})

	// Sources registry endpoints
	http.HandleFunc("/sources", func(w http.ResponseWriter, r *http.Request) {
		if allowCORS(w, r) {
			return
		}
		if r.Method == http.MethodGet {
			listSourcesHandler(w, r)
			return
		}
		if r.Method == http.MethodPost && r.URL.Path == "/sources/propose" {
			proposeRatingHandler(w, r)
			return
		}
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	http.HandleFunc("/sources/propose", func(w http.ResponseWriter, r *http.Request) {
		if allowCORS(w, r) {
			return
		}
		if r.Method == http.MethodPost {
			proposeRatingHandler(w, r)
			return
		}
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	})

	http.HandleFunc("/sources/", func(w http.ResponseWriter, r *http.Request) {
		if allowCORS(w, r) {
			return
		}
		// /sources/{id}/approve or /sources/{id}/compute or /sources/{id}/compute-leaning
		if strings.HasSuffix(r.URL.Path, "/approve") && r.Method == http.MethodPost {
			approveRatingHandler(w, r)
			return
		}
		if strings.HasSuffix(r.URL.Path, "/compute") && r.Method == http.MethodGet {
			computeScoreHandler(w, r)
			return
		}
		if strings.HasSuffix(r.URL.Path, "/compute-leaning") && r.Method == http.MethodGet {
			computeLeaningHandler(w, r)
			return
		}
		http.Error(w, "not found", http.StatusNotFound)
	})

	http.HandleFunc("/llm", func(w http.ResponseWriter, r *http.Request) {
		if allowCORS(w, r) {
			return
		}
		if r.Method != http.MethodGet {
			http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
			return
		}
		query := r.URL.Query().Get("q")
		if query == "" {
			http.Error(w, "missing query parameter 'q'", http.StatusBadRequest)
			return
		}

		if tryFakeLLMResponse(w, query) {
			return
		}

		fmt.Fprintf(os.Stderr, "LLM: starting query: %q\n", query) // <-- progress line
		llmStart := time.Now()
		result, err := QueryWithRetries(query, 3) // 3 attempts
		if err != nil {
			fmt.Fprintf(os.Stderr, "LLM: query failed: %v\n", err) // <-- progress line
			http.Error(w, fmt.Sprintf("LLM query failed: %v", err), http.StatusInternalServerError)
			return
		}
		llmLatency := time.Since(llmStart).Milliseconds()
		w.Header().Set("X-Go-To-LLM-Latency", strconv.FormatInt(llmLatency, 10))
		fmt.Fprintf(os.Stderr, "LLM: query succeeded (len=%d)", len(result)) // <-- progress line

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"response": %q}`, result)
	})

	fmt.Printf("heavy service listening on %s\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		fmt.Fprintf(os.Stderr, "failed to start heavy service: %v\n", err)
		os.Exit(1)
	}
}
