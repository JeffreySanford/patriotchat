/* eslint-disable no-restricted-syntax */
/**
 * API DTOs for frontend
 * These mirror the types in libs/shared for type safety
 * Frontend-only copy to work around module resolution issues with @nx/angular
 *
 * Note: This file disables the no-restricted-syntax rule for TSUnknownKeyword
 * because error handling legitimately requires flexible type handling
 */

// ===== Inference DTOs =====

export interface InferenceModelsResponse {
  models: Array<{
    id: string;
    name: string;
    description?: string;
    provider?: string;
    contextWindow?: number;
  }>;
}

export interface InferenceGenerateRequest {
  modelId?: string;
  model?: string; // Alias for modelId for flexibility
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface InferenceGenerateResponse {
  modelId?: string;
  model?: string;
  prompt: string;
  text?: string;
  result?: string; // Alias for text
  tokensUsed?: number;
  tokens?: number; // Alias for tokensUsed
  duration?: number;
  finishReason?: 'length' | 'stop' | 'error';
}

// ===== Auth DTOs =====

export interface AuthRegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  name?: string;
  expiresIn?: number;
}

export interface AuthValidateResponse {
  userId: string;
  email: string;
  name?: string;
  tier?: string;
  iat?: number;
  exp?: number;
}

/**
 * API Response wrapper type
 */
export type ApiResponseData = string | number | boolean | null | Record<string, unknown>;

export interface ApiResponse<T> {
  data: T;
  timestamp: number;
  status: number;
}

/**
 * Error details type - allows flexible error data from backend
 */
export type ErrorDetails = Record<string, unknown>;

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: ErrorDetails;
  public readonly expectedType?: string;
  public readonly receivedType?: string;
  public readonly timestamp: number;

  constructor(options: {
    status: number;
    message: string;
    code?: string;
    details?: ErrorDetails;
    expectedType?: string;
    receivedType?: string;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code || 'API_ERROR';
    this.details = options.details || {};
    this.expectedType = options.expectedType;
    this.receivedType = options.receivedType;
    this.timestamp = Date.now();

    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export class ValidationError extends ApiError {
  constructor(options: {
    message: string;
    expectedType: string;
    receivedType: string;
    details?: ErrorDetails;
  }) {
    super({
      status: 422,
      message: options.message,
      code: 'VALIDATION_ERROR',
      expectedType: options.expectedType,
      receivedType: options.receivedType,
      details: options.details,
    });
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
