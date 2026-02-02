package main

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestGenerateJWT(t *testing.T) {
	token := generateJWT("test-user-id")

	if token == "" {
		t.Fatal("expected non-empty token")
	}

	// Validate token structure
	claims := &jwt.RegisteredClaims{}
	_, err := jwt.ParseWithClaims(token, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte("dev-secret-change-in-prod"), nil
	})

	if err != nil {
		t.Fatalf("failed to parse token: %v", err)
	}

	if claims.Subject != "test-user-id" {
		t.Errorf("expected subject 'test-user-id', got '%s'", claims.Subject)
	}

	if claims.Issuer != "auth-service" {
		t.Errorf("expected issuer 'auth-service', got '%s'", claims.Issuer)
	}
}

func TestValidateJWT(t *testing.T) {
	userID := "test-user-123"
	token := generateJWT(userID)

	claims, err := validateJWT(token)
	if err != nil {
		t.Fatalf("failed to validate token: %v", err)
	}

	if claims.Subject != userID {
		t.Errorf("expected subject '%s', got '%s'", userID, claims.Subject)
	}
}

func TestValidateJWTExpired(t *testing.T) {
	// Create an expired token
	expiredToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.RegisteredClaims{
		Subject:   "test-user",
		ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)),
		IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
		Issuer:    "auth-service",
	})

	tokenString, _ := expiredToken.SignedString([]byte("dev-secret-change-in-prod"))

	_, err := validateJWT(tokenString)
	if err == nil {
		t.Fatal("expected error for expired token")
	}
}

func TestHealthResponse(t *testing.T) {
	response := HealthResponse{
		Status:  "ok",
		Service: "auth-service",
		Time:    time.Now().UTC().Format(time.RFC3339),
	}

	// Marshal to JSON
	data, err := json.Marshal(response)
	if err != nil {
		t.Fatalf("failed to marshal health response: %v", err)
	}

	// Unmarshal back
	var decoded HealthResponse
	if err := json.Unmarshal(data, &decoded); err != nil {
		t.Fatalf("failed to unmarshal health response: %v", err)
	}

	if decoded.Status != "ok" {
		t.Errorf("expected status 'ok', got '%s'", decoded.Status)
	}

	if decoded.Service != "auth-service" {
		t.Errorf("expected service 'auth-service', got '%s'", decoded.Service)
	}
}

func TestRegisterRequestValidation(t *testing.T) {
	testCases := []struct {
		name      string
		req       RegisterRequest
		isValid   bool
	}{
		{
			name:    "valid request",
			req:     RegisterRequest{Username: "john", Email: "john@example.com", Password: "password123"},
			isValid: true,
		},
		{
			name:    "missing username",
			req:     RegisterRequest{Email: "john@example.com", Password: "password123"},
			isValid: false,
		},
		{
			name:    "missing email",
			req:     RegisterRequest{Username: "john", Password: "password123"},
			isValid: false,
		},
		{
			name:    "missing password",
			req:     RegisterRequest{Username: "john", Email: "john@example.com"},
			isValid: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			valid := tc.req.Username != "" && tc.req.Email != "" && tc.req.Password != ""
			if valid != tc.isValid {
				t.Errorf("expected valid=%v, got %v", tc.isValid, valid)
			}
		})
	}
}

func TestLoginRequestValidation(t *testing.T) {
	testCases := []struct {
		name    string
		req     LoginRequest
		isValid bool
	}{
		{
			name:    "valid request",
			req:     LoginRequest{Email: "john@example.com", Password: "password123"},
			isValid: true,
		},
		{
			name:    "missing email",
			req:     LoginRequest{Password: "password123"},
			isValid: false,
		},
		{
			name:    "missing password",
			req:     LoginRequest{Email: "john@example.com"},
			isValid: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			valid := tc.req.Email != "" && tc.req.Password != ""
			if valid != tc.isValid {
				t.Errorf("expected valid=%v, got %v", tc.isValid, valid)
			}
		})
	}
}
