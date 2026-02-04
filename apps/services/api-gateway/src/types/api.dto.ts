/**
 * API DTOs for api-gateway
 * Combines shared types with local gateway-specific types
 */

// Import from shared library
export {
  InferenceModelsResponse,
  InferenceGenerateRequest,
  InferenceGenerateResponse,
  ApiError,
  ValidationError,
  ErrorDetails,
  ApiResponse,
} from '@patriotchat/shared';

// ============================================================================
// Analytics Types - Gateway-specific
// ============================================================================

export interface TrackEventRequest {
  eventType: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TrackEventResponse {
  status: string;
}

export interface StatsResponse {
  total_events: number;
  active_users: number;
  avg_latency: number;
}

// ============================================================================
// Auth Types - Gateway-specific
// ============================================================================

export interface AuthPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

// ============================================================================
// Error Handling - Gateway-specific
// ============================================================================

export interface ErrorResponse {
  response?: {
    status?: number;
    statusCode?: number;
    data?:
      | {
          error?: string;
          message?: string;
        }
      | string;
  };
  message?: string;
  status?: number;
}
