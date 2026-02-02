package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var db *sql.DB

type FundingRecord struct {
	ID          string    `json:"id"`
	EntityID    string    `json:"entity_id"`
	Amount      float64   `json:"amount"`
	Source      string    `json:"source"`
	RecipientID string    `json:"recipient_id"`
	Date        time.Time `json:"date"`
	CreatedAt   time.Time `json:"created_at"`
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
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4002"
	}

	http.HandleFunc("/health", handleHealth)
	http.HandleFunc("/ready", handleReady)
	http.HandleFunc("/funding/search", handleSearchFunding)
	http.HandleFunc("/funding/record", handleRecordFunding)

	log.Printf("Funding Service listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(HealthResponse{
		Status:  "ok",
		Service: "funding-service",
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
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(ReadyResponse{Status: "ready"})
}

func handleSearchFunding(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Method not allowed"})
		return
	}

	entityID := r.URL.Query().Get("entity_id")
	if entityID == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "entity_id query parameter required"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"entity_id": entityID,
		"records":   []FundingRecord{},
		"total":     0,
	})
}

func handleRecordFunding(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Method not allowed"})
		return
	}

	var record FundingRecord
	err := json.NewDecoder(r.Body).Decode(&record)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request body"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "recorded",
		"id":     "placeholder-uuid",
	})
}
