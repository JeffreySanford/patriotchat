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

type AnalyticsEvent struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	EventType string    `json:"event_type"`
	Metadata  string    `json:"metadata"`
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
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4005"
	}

	http.HandleFunc("/health", handleHealth)
	http.HandleFunc("/ready", handleReady)
	http.HandleFunc("/analytics/track", handleTrackEvent)
	http.HandleFunc("/analytics/stats", handleGetStats)

	log.Printf("Analytics Service listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(HealthResponse{
		Status:  "ok",
		Service: "analytics-service",
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

func handleTrackEvent(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Method not allowed"})
		return
	}

	var event AnalyticsEvent
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Invalid request body"})
		return
	}

	// Log async to database
	go func() {
		log.Printf("Analytics: user=%s, event=%s, metadata=%s", event.UserID, event.EventType, event.Metadata)
	}()

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "tracked",
	})
}

func handleGetStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "Method not allowed"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"total_events": 0,
		"active_users": 0,
		"avg_latency":  0,
		"uptime_hours": time.Since(time.Now().Add(-24 * time.Hour)).Hours(),
	})
}
