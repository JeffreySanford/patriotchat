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

	"github.com/google/uuid"
	"github.com/golang-jwt/jwt/v5"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/jaeger"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.21.0"
)

var (
	db     *sql.DB
	tracer = otel.Tracer("auth-service")
	tp     *trace.TracerProvider
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
	Token   string    `json:"token"`
	User    User      `json:"user"`
	ExpiresAt time.Time `json:"expires_at"`
}

// HealthResponse represents health check response
type HealthResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Time    string `json:"time"`
}

func init() {
	// Initialize OpenTelemetry
	exp, err := jaeger.New(jaeger.WithAgentHost(getEnv("JAEGER_HOST", "localhost")))
	if err != nil {
		log.Fatalf("failed to create jaeger exporter: %v", err)
	}

	res, err := resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("auth-service"),
		),
	)
	if err != nil {
		log.Fatalf("failed to create resource: %v", err)
	}

	tp = trace.NewTracerProvider(
		trace.WithBatcher(exp),
		trace.WithResource(res),
	)

	otel.SetTracerProvider(tp)
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

	// Register routes
	http.HandleFunc("/health", handleHealth)
	http.HandleFunc("/ready", handleReady)
	http.HandleFunc("/auth/register", handleRegister)
	http.HandleFunc("/auth/login", handleLogin)
	http.HandleFunc("/auth/validate", handleValidate)

	port := getEnv("PORT", "4001")
	log.Printf("Auth service listening on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
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

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db, nil
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
	`

	_, err := db.Exec(schema)
	return err
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "health-check")
	defer span.End()

	response := HealthResponse{
		Status:  "ok",
		Service: "auth-service",
		Time:    time.Now().UTC().Format(time.RFC3339),
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)

	logAudit(ctx, "system", "auth-service", "HEALTH_CHECK", "success")
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
	ctx, span := tracer.Start(r.Context(), "register-user")
	defer span.End()

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
	err = db.QueryRowContext(ctx, query, userID, req.Username, req.Email, hashedPassword, "free").
		Scan(&user.ID, &user.Username, &user.Email, &user.Tier, &user.CreatedAt)

	if err != nil {
		w.WriteHeader(http.StatusConflict)
		json.NewEncoder(w).Encode(map[string]string{"error": "user already exists"})
		logAudit(ctx, userID, "auth", "REGISTER", "failed - user exists")
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

	logAudit(ctx, userID, "auth", "REGISTER", "success")
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "login-user")
	defer span.End()

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

	err := db.QueryRowContext(ctx, query, req.Email).
		Scan(&user.ID, &user.Username, &user.Email, &user.Tier, &passwordHash, &user.CreatedAt)

	if err == sql.ErrNoRows {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{"error": "invalid credentials"})
		logAudit(ctx, "", "auth", "LOGIN", "failed - user not found")
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
		logAudit(ctx, user.ID, "auth", "LOGIN", "failed - wrong password")
		return
	}

	// Update last login
	_, _ = db.ExecContext(ctx, "UPDATE users SET last_login = NOW() WHERE id = $1", user.ID)

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

	logAudit(ctx, user.ID, "auth", "LOGIN", "success")
}

func handleValidate(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "validate-token")
	defer span.End()

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

	logAudit(ctx, claims.Subject, "auth", "VALIDATE_TOKEN", "success")
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

func logAudit(ctx context.Context, userID, service, operation, status string) {
	// TODO: Insert into audit_logs table
	// For now, just log to stdout
	log.Printf("[AUDIT] user_id=%s service=%s operation=%s status=%s", userID, service, operation, status)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
