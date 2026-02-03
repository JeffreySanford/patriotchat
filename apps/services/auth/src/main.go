package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

var (
	db *sql.DB
)

// User represents a user in the system
type User struct {
	ID        string    `json:"id"`
	Username  string    `json:"username"`
	Email     string    `json:"email"`
	Tier      string    `json:"tier"`
	CreatedAt time.Time `json:"created_at"`
}

// RegisterRequest represents a user registration request
type RegisterRequest struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginRequest represents a user login request
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// AuthResponse represents the response with JWT token
type AuthResponse struct {
	Token     string    `json:"token"`
	User      User      `json:"user"`
	ExpiresAt time.Time `json:"expires_at"`
}

// HealthResponse represents health check response
type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Time    string `json:"time"`
}

func main() {
	// Initialize database
	var err error
	db, err = initDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Create tables
	if err := createTables(); err != nil {
		log.Fatalf("Failed to create tables: %v", err)
	}

	// Seed test user
	if err := seedTestUser(); err != nil {
		log.Printf("Warning: Failed to seed test user: %v", err)
	}

	// Register routes
	http.HandleFunc("/health", handleHealth)
	http.HandleFunc("/ready", handleReady)
	http.HandleFunc("/auth/register", handleRegister)
	http.HandleFunc("/auth/login", handleLogin)
	http.HandleFunc("/auth/validate", handleValidate)

	port := getEnv("PORT", "4001")
	address := ":" + port

	// Retry logic for port binding with exponential backoff
	maxRetries := 10
	retryDelay := time.Second

	for i := 0; i < maxRetries; i++ {
		log.Printf("Auth service listening on port %s (attempt %d/%d)", port, i+1, maxRetries)
		err := http.ListenAndServe(address, nil)
		if err == nil {
			return
		}

		if i < maxRetries-1 {
			log.Printf("Failed to bind to port %s: %v, retrying in %v", port, err, retryDelay)
			time.Sleep(retryDelay)
			retryDelay *= 2
		} else {
			log.Fatalf("Failed to bind to port %s after %d attempts: %v", port, maxRetries, err)
		}
	}
}

func initDB() (*sql.DB, error) {
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_USER", "postgres"),
		getEnv("DB_PASSWORD", "postgres"),
		getEnv("DB_NAME", "patriotchat"),
	)

	var db *sql.DB
	var err error

	// Retry logic with exponential backoff
	maxRetries := 10
	retryDelay := time.Second

	for i := 0; i < maxRetries; i++ {
		db, err = sql.Open("postgres", connStr)
		if err != nil {
			log.Printf("Failed to open database (attempt %d/%d): %v", i+1, maxRetries, err)
			time.Sleep(retryDelay)
			retryDelay *= 2
			continue
		}

		// Test connection
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		pingErr := db.PingContext(ctx)
		cancel()

		if pingErr == nil {
			// Connection successful
			db.SetMaxOpenConns(25)
			db.SetMaxIdleConns(5)
			db.SetConnMaxLifetime(5 * time.Minute)
			return db, nil
		}

		db.Close()
		log.Printf("Failed to ping database (attempt %d/%d): %v", i+1, maxRetries, pingErr)
		time.Sleep(retryDelay)
		retryDelay *= 2
	}

	return nil, fmt.Errorf("failed to connect to database after %d attempts: %v", maxRetries, err)
}

func createTables() error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		username VARCHAR(255) UNIQUE NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		password_hash VARCHAR(255) NOT NULL,
		tier VARCHAR(20) NOT NULL DEFAULT 'free',
		status VARCHAR(20) DEFAULT 'active',
		email_verified BOOLEAN DEFAULT false,
		email_verified_at TIMESTAMP NULL,
		last_login TIMESTAMP NULL,
		created_at TIMESTAMP DEFAULT now(),
		updated_at TIMESTAMP DEFAULT now()
	);

	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
	CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

	CREATE TABLE IF NOT EXISTS audit_logs (
		id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
		entity_type VARCHAR(50),
		entity_id VARCHAR(255),
		operation VARCHAR(50),
		user_id UUID,
		service VARCHAR(100),
		created_at TIMESTAMP DEFAULT now()
	);

	CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
	CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
	`

	_, err := db.Exec(schema)
	return err
}

func seedTestUser() error {
	// Check if test user already exists
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", "test@example.com").Scan(&exists)
	if err != nil {
		return err
	}

	if exists {
		return nil // User already exists, skip seeding
	}

	// Hash password for "password"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Create test user
	userID := uuid.New().String()
	query := `
		INSERT INTO users (id, username, email, password_hash, tier, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
	`

	_, err = db.ExecContext(context.Background(), query,
		userID,
		"testuser",
		"test@example.com",
		hashedPassword,
		"free",
		"active",
	)

	if err != nil {
		return fmt.Errorf("failed to seed test user: %v", err)
	}

	log.Printf("Test user seeded successfully (email: test@example.com, password: password)")
	return nil
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:  "ok",
		Service: "auth-service",
		Time:    time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)

	logAudit(r.Context(), "system", "auth-service", "HEALTH_CHECK", "success")
}

func handleReady(w http.ResponseWriter, r *http.Request) {
	// Check database connection
	if err := db.PingContext(r.Context()); err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		json.NewEncoder(w).Encode(map[string]string{"status": "not ready"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ready"})
}

func handleRegister(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Validate input
	if req.Username == "" || req.Email == "" || req.Password == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "username, email, and password required"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "failed to process password"})
		return
	}

	// Create user
	userID := uuid.New().String()
	query := `
		INSERT INTO users (id, username, email, password_hash, tier, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		RETURNING id, username, email, tier, created_at
	`

	var user User
	err = db.QueryRowContext(r.Context(), query, userID, req.Username, req.Email, hashedPassword, "free").
		Scan(&user.ID, &user.Username, &user.Email, &user.Tier, &user.CreatedAt)

	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "user already exists"})
		logAudit(r.Context(), userID, "auth", "REGISTER", "failed - user exists")
		return
	}

	// Generate JWT
	token := generateJWT(user.ID)
	expiresAt := time.Now().Add(24 * time.Hour)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(AuthResponse{
		Token:     token,
		User:      user,
		ExpiresAt: expiresAt,
	})

	logAudit(r.Context(), userID, "auth", "REGISTER", "success")
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid request"})
		return
	}

	// Find user
	var user User
	var passwordHash string
	query := `
		SELECT id, username, email, tier, password_hash, created_at
		FROM users WHERE email = $1 AND status = 'active'
	`

	err := db.QueryRowContext(r.Context(), query, req.Email).
		Scan(&user.ID, &user.Username, &user.Email, &user.Tier, &passwordHash, &user.CreatedAt)

	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid credentials"})
		logAudit(r.Context(), "", "auth", "LOGIN", "failed - user not found")
		return
	}

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "database error"})
		return
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password)); err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid credentials"})
		logAudit(r.Context(), user.ID, "auth", "LOGIN", "failed - wrong password")
		return
	}

	// Update last login
	_, _ = db.ExecContext(r.Context(), "UPDATE users SET last_login = NOW() WHERE id = $1", user.ID)

	// Generate JWT
	token := generateJWT(user.ID)
	expiresAt := time.Now().Add(24 * time.Hour)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(AuthResponse{
		Token:     token,
		User:      user,
		ExpiresAt: expiresAt,
	})

	logAudit(r.Context(), user.ID, "auth", "LOGIN", "success")
}

func handleValidate(w http.ResponseWriter, r *http.Request) {
	// Extract JWT from header
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "missing token"})
		return
	}

	token := authHeader[7:] // Remove "Bearer " prefix

	// Parse and validate JWT
	claims, err := validateJWT(token)
	if err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid token"})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"valid":   true,
		"user_id": claims.Subject,
	})

	logAudit(r.Context(), claims.Subject, "auth", "VALIDATE_TOKEN", "success")
}

func generateJWT(userID string) string {
	secret := []byte(getEnv("JWT_SECRET", "dev-secret-change-in-prod"))
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Subject:   userID,
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now()),
		Issuer:    "auth-service",
	})

	tokenString, _ := token.SignedString(secret)
	return tokenString
}

func validateJWT(tokenString string) (jwt.RegisteredClaims, error) {
	secret := []byte(getEnv("JWT_SECRET", "dev-secret-change-in-prod"))
	token, err := jwt.ParseWithClaims(tokenString, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		return secret, nil
	})

	if err != nil || !token.Valid {
		return jwt.RegisteredClaims{}, err
	}

	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok {
		return jwt.RegisteredClaims{}, fmt.Errorf("invalid claims")
	}

	return *claims, nil
}

func logAudit(_ context.Context, userID, service, operation, _ string) {
	// Run async to avoid blocking requests
	go func() {
		var userIDPtr *string

		// Only set user_id if it's a valid UUID and exists in database
		if userID != "" && userID != "system" && len(userID) == 36 {
			// Verify user exists before referencing in audit log
			var exists bool
			checkQuery := `SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)`
			db.QueryRowContext(context.Background(), checkQuery, userID).Scan(&exists)
			if exists {
				userIDPtr = &userID
			}
		}

		// Use user_id as entity_id if available, otherwise use system marker
		entityID := userID
		if entityID == "" || entityID == "system" || len(entityID) != 36 {
			entityID = "00000000-0000-0000-0000-000000000001" // System operations marker
		}

		query := `
			INSERT INTO audit_logs (entity_type, entity_id, operation, user_id, service)
			VALUES ($1, $2, $3, $4, $5)
		`

		// Use background context to avoid request cancellation
		_, err := db.ExecContext(context.Background(), query,
			"user",    // entity_type
			entityID,  // entity_id
			operation, // operation
			userIDPtr, // user_id (can be NULL)
			service,   // service
		)

		if err != nil {
			log.Printf("[AUDIT_ERROR] Failed to insert audit log: %v | userID=%s op=%s", err, userID, operation)
		}
	}()
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
