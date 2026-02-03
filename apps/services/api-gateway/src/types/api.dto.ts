/**
 * API DTOs for api-gateway
 * These are local copies of shared DTOs to work around module resolution issues
 * with the dev server. In production builds, these are replaced with imports from
 * @patriotchat/shared.
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ErrorDetails {
  field?: string;
  reason?: string;
  timestamp?: string;
  requestId?: string;
  [key: string]: string | undefined;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// ============================================================================
// LLM / Inference Types
// ============================================================================

export interface InferenceModel {
  id: string;
  name: string;
  description: string;
  provider: string;
}

export interface InferenceModelsResponse {
  models: InferenceModel[];
}

export interface InferenceGenerateRequest {
  prompt: string;
  model: string;
  context?: string;
}

export interface InferenceGenerateResponse {
  prompt: string;
  text: string;
  model: string;
  tokens: number;
  duration: number;
}

// ============================================================================
// Auth Types
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
// Analytics Types
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
// Error Handling
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

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    public details?: ErrorDetails,
    message?: string,
  ) {
    super(message || code);
    this.name = 'ApiError';
  }
}
