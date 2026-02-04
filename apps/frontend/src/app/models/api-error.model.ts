/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
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
      const apiError: ApiErrorDetail = error.error as ApiErrorDetail;
      return apiError.error || apiError.message || 'An error occurred';
    }
    return error.statusText || 'An error occurred';
  }

  if (isStandardError(error)) {
    return error.message || 'An error occurred';
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj: ApiErrorResponse = error as ApiErrorResponse;
    if ('message' in errorObj && typeof errorObj['message'] === 'string') {
      return errorObj['message'];
    }
    if ('error' in errorObj && typeof errorObj['error'] === 'string') {
      return errorObj['error'];
    }
  }

  return 'An unexpected error occurred';
}
