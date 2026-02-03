import { HttpErrorResponse } from '@angular/common/http';

export interface ApiErrorDetail {
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail | string;
  status: number;
  statusText: string;
}

export type HttpError = HttpErrorResponse | ApiErrorResponse | Error;

export function isHttpErrorResponse(
  error: HttpError,
): error is HttpErrorResponse {
  return 'status' in error && 'statusText' in error;
}

export function isApiErrorResponse(
  error: HttpError,
): error is ApiErrorResponse {
  return 'error' in error && 'status' in error;
}

export function isStandardError(error: HttpError): error is Error {
  return error instanceof Error;
}

export function getErrorMessage(error: HttpError): string {
  if (isHttpErrorResponse(error)) {
    if (
      typeof error.error === 'object' &&
      error.error !== null &&
      'error' in error.error
    ) {
      const apiError: Record<string, string | number | boolean | object> =
        error.error as Record<string, string | number | boolean | object>;
      if (typeof apiError['error'] === 'string') {
        return apiError['error'];
      }
    }
    return error.statusText || 'HTTP Error';
  }

  if (isStandardError(error)) {
    return error.message || 'An error occurred';
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj: Record<string, string | number | boolean | object> =
      error as Record<string, string | number | boolean | object>;
    if (typeof errorObj['message'] === 'string') {
      return errorObj['message'];
    }
    if (typeof errorObj['error'] === 'string') {
      return errorObj['error'];
    }
  }

  return 'An unexpected error occurred';
}
