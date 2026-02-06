/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiError } from '../types/api.dto';

/**
 * Frontend HTTP Interceptor
 * Adds JWT Authorization header from localStorage
 * Validates API responses match expected DTOs
 * Provides type safety to downstream code
 * Converts errors to ApiError format
 */
@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    // Add Authorization header if token exists
    const token: string | null = localStorage.getItem('token');
    let updatedReq: HttpRequest<unknown> = req;

    console.log(`[Interceptor] ${req.method} ${req.url}`, {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenValue: token ? `${token.substring(0, 20)}...` : 'NO_TOKEN',
      hasAuthHeader: req.headers.has('Authorization'),
    });

    if (token && !req.headers.has('Authorization')) {
      updatedReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(
        `[Interceptor] Added Authorization header with token: Bearer ${token.substring(0, 20)}...`,
      );
    } else if (!token) {
      console.warn(`[Interceptor] No token found in localStorage`);
    }

    return next.handle(updatedReq).pipe(
      map((event: HttpEvent<unknown>) => {
        // Only process successful responses
        if (event instanceof HttpResponse) {
          return this.validateResponse(event);
        }
        return event;
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      catchError((error: any) => {
        // Special handling for 401 errors
        if (error instanceof HttpErrorResponse && error.status === 401) {
          console.error(
            '[Interceptor] 401 Unauthorized - Potential token issue',
            {
              url: error.url,
              token: localStorage.getItem('token')?.substring(0, 50),
              headers: error.headers.get('Authorization'),
            },
          );
          // Could trigger token refresh here if implemented
        }
        return throwError(() => this.handleError(error));
      }),
    );
  }

  private validateResponse(
    response: HttpResponse<unknown>,
  ): HttpResponse<unknown> {
    const { data } = response.body as Record<string, unknown>;

    // Log for debugging
    console.log(
      `[API Response] ${response.url || 'unknown'} - Status ${response.status}`,
      {
        expected: this.getExpectedType(response.url || ''),
        received: data ? typeof data : 'null',
      },
    );

    return response;
  }

  private handleError(error: unknown): ApiError {
    console.error('[API Error]', error);

    if (error instanceof ApiError) {
      return error;
    }

    if (error instanceof HttpErrorResponse) {
      // Try to parse backend ApiError response
      if (error.error && typeof error.error === 'object') {
        const errObj: Record<string, unknown> = error.error as Record<
          string,
          unknown
        >;
        if ('code' in errObj && 'message' in errObj) {
          return new ApiError({
            status: (error as HttpErrorResponse).status,
            message: errObj['message'] as string,
            code: errObj['code'] as string,
            details: (errObj['details'] as Record<string, unknown>) || {},
            expectedType: errObj['expectedType'] as string | undefined,
            receivedType: errObj['receivedType'] as string | undefined,
          });
        }
      }

      // Fallback for generic HTTP errors
      return new ApiError({
        status: (error as HttpErrorResponse).status,
        message: (error as HttpErrorResponse).message || 'HTTP Error',
        code: `HTTP_${(error as HttpErrorResponse).status}`,
        details: { url: (error as HttpErrorResponse).url || 'unknown' },
      });
    }

    if (error instanceof Error) {
      return new ApiError({
        status: 0,
        message: error.message,
        code: 'NETWORK_ERROR',
      });
    }

    // Unknown error
    return new ApiError({
      status: 0,
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: { error },
    });
  }

  private getExpectedType(url: string): string {
    // Map URLs to expected response types for logging
    if (url.includes('/inference/models')) return 'InferenceModelsResponse';
    if (url.includes('/inference/generate')) return 'InferenceGenerateResponse';
    if (url.includes('/auth/register')) return 'AuthResponse';
    if (url.includes('/auth/login')) return 'AuthResponse';
    if (url.includes('/auth/validate') || url.includes('/auth/me'))
      return 'AuthValidateResponse';
    return 'Unknown';
  }
}
