/* eslint-disable no-restricted-syntax */
/**
 * API Response wrapper and error types
 *
 * Note: This file disables the no-restricted-syntax rule for TSUnknownKeyword
 * because error handling requires flexible type handling. ErrorDetails uses
 * Record<string, unknown> to allow backends to return any structured error data.
 */

/**
 * Error details type - allows flexible error data from backend
 */
export type ErrorDetails = Record<string, unknown>;

export interface ApiResponse<T> {
  data: T;
  timestamp: number;
  status: number;
}

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
