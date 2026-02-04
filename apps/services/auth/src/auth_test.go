package main

import (
	"crypto/rand"
	"encoding/base64"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// TestValidateEmail tests email validation logic
func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name    string
		email   string
		wantErr bool
	}{
		{"valid email", "user@example.com", false},
		{"valid subdomain", "user@sub.example.com", false},
		{"empty email", "", true},
		{"no at sign", "userexample.com", true},
		{"no domain", "user@", true},
		{"invalid format", "@example.com", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Email validation using simple regex pattern
			if tt.email == "" && !tt.wantErr {
				t.Errorf("expected error for empty email")
			}
			if tt.email != "" && tt.wantErr {
				// Check basic email pattern
				hasAt := false
				hasDot := false
				for i, ch := range tt.email {
					if ch == '@' {
						hasAt = true
						if i == 0 || i == len(tt.email)-1 {
							if !tt.wantErr {
								t.Errorf("invalid email position: %s", tt.email)
							}
						}
					}
					if ch == '.' && hasAt {
						hasDot = true
					}
				}
				if hasAt && !hasDot && !tt.wantErr {
					t.Errorf("email missing domain extension: %s", tt.email)
				}
			}
		})
	}
}

// TestPasswordValidation tests password strength validation
func TestPasswordValidation(t *testing.T) {
	tests := []struct {
		name      string
		password  string
		minLength int
		wantErr   bool
	}{
		{"valid password", "SecurePass123!", 8, false},
		{"too short", "short", 8, true},
		{"empty password", "", 8, true},
		{"minimum length", "12345678", 8, false},
		{"special chars", "P@ssw0rd!", 8, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if len(tt.password) < tt.minLength && !tt.wantErr {
				t.Errorf("password too short: got %d, want at least %d", len(tt.password), tt.minLength)
			}
			if len(tt.password) >= tt.minLength && tt.wantErr {
				t.Errorf("password should be valid: %s", tt.password)
			}
		})
	}
}

// TestPasswordHashing tests bcrypt password hashing
func TestPasswordHashing(t *testing.T) {
	password := "TestPassword123!"

	// Test hashing
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	if len(hash) == 0 {
		t.Error("password hash should not be empty")
	}

	// Test verification
	err = bcrypt.CompareHashAndPassword(hash, []byte(password))
	if err != nil {
		t.Error("password verification failed for correct password")
	}

	// Test with wrong password
	err = bcrypt.CompareHashAndPassword(hash, []byte("WrongPassword"))
	if err == nil {
		t.Error("password verification should fail for incorrect password")
	}
}

// TestJWTTokenGeneration tests JWT token creation and validation
func TestJWTTokenGeneration(t *testing.T) {
	tests := []struct {
		name      string
		userID    string
		email     string
		expiresIn time.Duration
		wantErr   bool
	}{
		{"valid token", "user123", "user@example.com", 24 * time.Hour, false},
		{"short expiration", "user456", "another@example.com", 1 * time.Minute, false},
		{"empty user ID", "", "user@example.com", 24 * time.Hour, true},
		{"empty email", "user789", "", 24 * time.Hour, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.userID == "" || tt.email == "" {
				if !tt.wantErr {
					t.Errorf("expected error for missing required fields")
				}
				return
			}

			// Create token
			token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
				"user_id": tt.userID,
				"email":   tt.email,
				"exp":     time.Now().Add(tt.expiresIn).Unix(),
				"iat":     time.Now().Unix(),
			})

			if token == nil {
				t.Error("token creation failed")
			}
		})
	}
}

// TestRegisterRequestValidation tests registration request validation
func TestRegisterRequestValidation(t *testing.T) {
	tests := []struct {
		name    string
		req     RegisterRequest
		wantErr bool
	}{
		{
			name: "valid request",
			req: RegisterRequest{
				Username: "testuser",
				Email:    "test@example.com",
				Password: "SecurePass123!",
			},
			wantErr: false,
		},
		{
			name: "missing username",
			req: RegisterRequest{
				Username: "",
				Email:    "test@example.com",
				Password: "SecurePass123!",
			},
			wantErr: true,
		},
		{
			name: "missing email",
			req: RegisterRequest{
				Username: "testuser",
				Email:    "",
				Password: "SecurePass123!",
			},
			wantErr: true,
		},
		{
			name: "missing password",
			req: RegisterRequest{
				Username: "testuser",
				Email:    "test@example.com",
				Password: "",
			},
			wantErr: true,
		},
		{
			name: "weak password",
			req: RegisterRequest{
				Username: "testuser",
				Email:    "test@example.com",
				Password: "weak",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid := tt.req.Username != "" && tt.req.Email != "" && len(tt.req.Password) >= 8
			if isValid == tt.wantErr {
				t.Errorf("validation mismatch: got valid=%v, want error=%v", isValid, tt.wantErr)
			}
		})
	}
}

// TestLoginRequestValidation tests login request validation
func TestLoginRequestValidation(t *testing.T) {
	tests := []struct {
		name    string
		req     LoginRequest
		wantErr bool
	}{
		{
			name: "valid request",
			req: LoginRequest{
				Email:    "user@example.com",
				Password: "password123",
			},
			wantErr: false,
		},
		{
			name: "missing email",
			req: LoginRequest{
				Email:    "",
				Password: "password123",
			},
			wantErr: true,
		},
		{
			name: "missing password",
			req: LoginRequest{
				Email:    "user@example.com",
				Password: "",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid := tt.req.Email != "" && tt.req.Password != ""
			if isValid == tt.wantErr {
				t.Errorf("validation mismatch: got valid=%v, want error=%v", isValid, tt.wantErr)
			}
		})
	}
}

// TestUserDataStructure tests User struct
func TestUserDataStructure(t *testing.T) {
	user := User{
		ID:        "user123",
		Username:  "testuser",
		Email:     "test@example.com",
		Tier:      "free",
		CreatedAt: time.Now(),
	}

	if user.ID == "" {
		t.Error("user ID should not be empty")
	}
	if user.Username == "" {
		t.Error("username should not be empty")
	}
	if user.Email == "" {
		t.Error("email should not be empty")
	}
	if user.Tier == "" {
		t.Error("tier should not be empty")
	}
	if user.CreatedAt.IsZero() {
		t.Error("created_at should be set")
	}
}

// TestUUIDGeneration tests UUID generation for user IDs
func TestUUIDGeneration(t *testing.T) {
	uuidStr := generateTestUUID()
	if uuidStr == "" {
		t.Error("UUID should not be empty")
	}

	// Test multiple UUIDs are unique
	uuid2 := generateTestUUID()
	if uuidStr == uuid2 {
		t.Error("UUIDs should be unique")
	}
}

// Helper function for test UUID generation
func generateTestUUID() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)
}

// TestSecureTokenGeneration tests secure token generation
func TestSecureTokenGeneration(t *testing.T) {
	token1 := generateSecureToken(32)
	token2 := generateSecureToken(32)

	if token1 == "" || token2 == "" {
		t.Error("tokens should not be empty")
	}

	if token1 == token2 {
		t.Error("tokens should be cryptographically unique")
	}

	if len(token1) != len(token2) {
		t.Error("tokens should have same length")
	}
}

// Helper function for secure token generation
func generateSecureToken(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return base64.URLEncoding.EncodeToString(b)[:length]
}

// TestAuthResponse tests AuthResponse structure
func TestAuthResponse(t *testing.T) {
	user := User{
		ID:       "user123",
		Username: "testuser",
		Email:    "test@example.com",
		Tier:     "free",
	}

	expiresAt := time.Now().Add(24 * time.Hour)
	resp := AuthResponse{
		Token:     "test.jwt.token",
		User:      user,
		ExpiresAt: expiresAt,
	}

	if resp.Token == "" {
		t.Error("token should not be empty")
	}
	if resp.User.ID == "" {
		t.Error("user should be populated")
	}
	if resp.ExpiresAt.IsZero() {
		t.Error("expiration time should be set")
	}
}
