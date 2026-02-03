/**
 * Error handler utilities
 * Provides type-safe error handling for caught exceptions
 */

export interface AppError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Base application exception class
 */
export class AppException extends Error implements AppError {
  code?: string;
  status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'AppException';
    this.code = code;
    this.status = status;
    Object.setPrototypeOf(this, AppException.prototype);
  }
}

/**
 * Safely extract error message from caught error
 */
export function getErrorMessage(error: Error | AppException): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Unknown error occurred';
}

/**
 * Safely extract error status code from caught error
 */
export function getErrorStatus(error: Error | AppException): number {
  if (error instanceof AppException) {
    return error.status || 500;
  }
  return 500;
}
