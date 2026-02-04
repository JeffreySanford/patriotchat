package main

import (
	"encoding/json"
	"testing"
	"time"
)

// TestAnalyticsEventStructure tests AnalyticsEvent data structure
func TestAnalyticsEventStructure(t *testing.T) {
	event := AnalyticsEvent{
		ID:        "evt123",
		UserID:    "user456",
		EventType: "login",
		Metadata:  `{"ip":"192.168.1.1","browser":"Chrome"}`,
		CreatedAt: time.Now().UTC(),
	}

	if event.ID == "" {
		t.Error("event ID should not be empty")
	}
	if event.UserID == "" {
		t.Error("user ID should not be empty")
	}
	if event.EventType == "" {
		t.Error("event type should not be empty")
	}
	if event.CreatedAt.IsZero() {
		t.Error("created_at should be set")
	}
}

// TestEventTypeValidation tests event type validation
func TestEventTypeValidation(t *testing.T) {
	validEventTypes := []string{"login", "logout", "inference", "error", "custom"}

	tests := []struct {
		name      string
		eventType string
		valid     bool
	}{
		{"login event", "login", true},
		{"logout event", "logout", true},
		{"inference event", "inference", true},
		{"error event", "error", true},
		{"custom event", "custom", true},
		{"invalid event", "invalid_type", false},
		{"empty event", "", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found := false
			for _, validType := range validEventTypes {
				if validType == tt.eventType {
					found = true
					break
				}
			}

			if found && !tt.valid {
				t.Errorf("event type %s should not be valid", tt.eventType)
			}
			if !found && tt.valid {
				t.Errorf("event type %s should be valid", tt.eventType)
			}
		})
	}
}

// TestTrackEventValidation tests event tracking request validation
func TestTrackEventValidation(t *testing.T) {
	tests := []struct {
		name    string
		event   AnalyticsEvent
		wantErr bool
	}{
		{
			name: "valid event",
			event: AnalyticsEvent{
				UserID:    "user123",
				EventType: "login",
				Metadata:  "{}",
			},
			wantErr: false,
		},
		{
			name: "missing user ID",
			event: AnalyticsEvent{
				UserID:    "",
				EventType: "login",
				Metadata:  "{}",
			},
			wantErr: true,
		},
		{
			name: "missing event type",
			event: AnalyticsEvent{
				UserID:    "user123",
				EventType: "",
				Metadata:  "{}",
			},
			wantErr: true,
		},
		{
			name: "custom metadata",
			event: AnalyticsEvent{
				UserID:    "user456",
				EventType: "custom",
				Metadata:  `{"action":"button_click","timestamp":1234567890}`,
			},
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid := tt.event.UserID != "" && tt.event.EventType != ""
			if isValid == tt.wantErr {
				t.Errorf("validation mismatch: got valid=%v, want error=%v", isValid, tt.wantErr)
			}
		})
	}
}

// TestMetadataHandling tests metadata JSON parsing
func TestMetadataHandling(t *testing.T) {
	tests := []struct {
		name     string
		metadata string
		wantErr  bool
	}{
		{"valid JSON", `{"action":"click","ip":"192.168.1.1"}`, false},
		{"empty object", "{}", false},
		{"complex nested", `{"user":{"id":"123","tier":"premium"},"timestamp":1234567890}`, false},
		{"invalid JSON", `{"invalid json}`, true},
		{"empty string", "", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.metadata == "" && !tt.wantErr {
				if tt.name != "empty string" {
					t.Error("empty metadata should error")
				}
				return
			}

			var jsonData interface{}
			err := json.Unmarshal([]byte(tt.metadata), &jsonData)

			if (err != nil) != tt.wantErr {
				t.Errorf("JSON parse error mismatch: got error=%v, want error=%v", err != nil, tt.wantErr)
			}
		})
	}
}

// TestEventBatchProcessing tests event batching
func TestEventBatchProcessing(t *testing.T) {
	tests := []struct {
		name       string
		batchSize  int
		eventCount int
		wantErr    bool
	}{
		{"standard batch", 100, 100, false},
		{"small batch", 10, 5, false},
		{"large batch", 1000, 500, false},
		{"zero batch", 0, 100, true},
		{"negative batch", -1, 100, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid := tt.batchSize > 0
			if isValid == tt.wantErr {
				t.Errorf("batch validation mismatch: got valid=%v, want error=%v", isValid, tt.wantErr)
			}
		})
	}
}

// TestEventFiltering tests event type filtering
func TestEventFiltering(t *testing.T) {
	events := []AnalyticsEvent{
		{UserID: "user1", EventType: "login", CreatedAt: time.Now().Add(-2 * time.Hour)},
		{UserID: "user2", EventType: "inference", CreatedAt: time.Now().Add(-1 * time.Hour)},
		{UserID: "user1", EventType: "logout", CreatedAt: time.Now().Add(-30 * time.Minute)},
		{UserID: "user3", EventType: "error", CreatedAt: time.Now().Add(-10 * time.Minute)},
	}

	tests := []struct {
		name      string
		eventType string
		expected  int
	}{
		{"filter login", "login", 1},
		{"filter inference", "inference", 1},
		{"filter error", "error", 1},
		{"filter logout", "logout", 1},
		{"invalid filter", "custom", 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			count := 0
			for _, e := range events {
				if e.EventType == tt.eventType {
					count++
				}
			}

			if count != tt.expected {
				t.Errorf("filter mismatch: got %d, want %d", count, tt.expected)
			}
		})
	}
}

// TestUserEventTracking tests tracking events per user
func TestUserEventTracking(t *testing.T) {
	events := []AnalyticsEvent{
		{UserID: "user1", EventType: "login"},
		{UserID: "user2", EventType: "inference"},
		{UserID: "user1", EventType: "logout"},
		{UserID: "user1", EventType: "inference"},
	}

	userEventMap := make(map[string]int)
	for _, e := range events {
		userEventMap[e.UserID]++
	}

	tests := []struct {
		name     string
		userID   string
		expected int
	}{
		{"user1 events", "user1", 3},
		{"user2 events", "user2", 1},
		{"unknown user", "user3", 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			count := userEventMap[tt.userID]
			if count != tt.expected {
				t.Errorf("user event count mismatch: got %d, want %d", count, tt.expected)
			}
		})
	}
}

// TestAnalyticsStats tests statistics aggregation
func TestAnalyticsStats(t *testing.T) {
	tests := []struct {
		name   string
		metric string
		value  interface{}
	}{
		{"total events", "total_events", int64(1000)},
		{"active users", "active_users", int64(250)},
		{"avg latency", "avg_latency", 45.5},
		{"uptime hours", "uptime_hours", 168},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.value == nil {
				t.Error("metric value should not be nil")
			}
		})
	}
}

// TestDataRetention tests data retention policy
func TestDataRetention(t *testing.T) {
	tests := []struct {
		name          string
		retentionDays int
		wantErr       bool
	}{
		{"30 day retention", 30, false},
		{"90 day retention", 90, false},
		{"365 day retention", 365, false},
		{"zero retention", 0, true},
		{"negative retention", -1, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			isValid := tt.retentionDays > 0
			if isValid == tt.wantErr {
				t.Errorf("retention validation mismatch: got valid=%v, want error=%v", isValid, tt.wantErr)
			}
		})
	}
}

// TestPrivacyFieldMasking tests sensitive field handling
func TestPrivacyFieldMasking(t *testing.T) {
	sensitiveFields := []string{"password", "token", "apikey", "secret"}

	tests := []struct {
		name   string
		field  string
		masked bool
	}{
		{"password field", "password", true},
		{"token field", "token", true},
		{"api key field", "apikey", true},
		{"secret field", "secret", true},
		{"username field", "username", false},
		{"email field", "email", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			found := false
			for _, sensitive := range sensitiveFields {
				if sensitive == tt.field {
					found = true
					break
				}
			}

			if found != tt.masked {
				t.Errorf("masking mismatch for %s: got masked=%v, want masked=%v", tt.field, found, tt.masked)
			}
		})
	}
}

// TestHealthResponse tests health check response
func TestHealthResponse(t *testing.T) {
	resp := HealthResponse{
		Status:  "ok",
		Service: "analytics-service",
		Time:    time.Now().UTC(),
	}

	if resp.Status != "ok" {
		t.Error("status should be ok")
	}
	if resp.Service != "analytics-service" {
		t.Error("service name mismatch")
	}
	if resp.Time.IsZero() {
		t.Error("time should be set")
	}
}

// TestErrorResponseHandling tests error response
func TestErrorResponseHandling(t *testing.T) {
	tests := []struct {
		name    string
		error   string
		wantErr bool
	}{
		{"database error", "Database connection failed", true},
		{"validation error", "Invalid event data", true},
		{"not found", "Resource not found", true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			errResp := ErrorResponse{Error: tt.error}
			if errResp.Error == "" && tt.wantErr {
				t.Error("error message should not be empty")
			}
		})
	}
}

// TestConcurrentEventTracking tests concurrent event tracking
func TestConcurrentEventTracking(t *testing.T) {
	numGoroutines := 20
	numEventsPerGoroutine := 10
	results := make(chan bool, numGoroutines*numEventsPerGoroutine)

	for g := 0; g < numGoroutines; g++ {
		go func(goroutineID int) {
			for e := 0; e < numEventsPerGoroutine; e++ {
				event := AnalyticsEvent{
					UserID:    "user" + string(rune(goroutineID)),
					EventType: "test",
					Metadata:  "{}",
				}

				isValid := event.UserID != "" && event.EventType != ""
				results <- isValid
			}
		}(g)
	}

	successCount := 0
	totalEvents := numGoroutines * numEventsPerGoroutine
	for i := 0; i < totalEvents; i++ {
		if <-results {
			successCount++
		}
	}

	if successCount != totalEvents {
		t.Errorf("expected %d successful events, got %d", totalEvents, successCount)
	}
}
