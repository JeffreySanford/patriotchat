import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '../../types/api.dto';

/**
 * Error Interceptor
 * Catches exceptions and converts them to ApiError format
 * Logs validation errors for debugging
 */
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Record<string, never>> {
    return next.handle().pipe(
      catchError((error: Error | Record<string, string>): Observable<never> => {
        console.error('API Error:', error);

        if (error instanceof ApiError) {
          // Already an ApiError, just pass through
          return throwError(() => error);
        }

        if (error instanceof Error) {
          // Convert standard errors to ApiError
          const apiError: ApiError = new ApiError(
            500,
            'INTERNAL_ERROR',
            {
              originalError: error.name,
            },
            error.message,
          );
          return throwError(() => apiError);
        }

        // Unknown error format - create ApiError from error object
        const apiError: ApiError = new ApiError(
          500,
          'UNKNOWN_ERROR',
          { originalError: JSON.stringify(error) },
          'An unexpected error occurred',
        );
        return throwError((): ApiError => apiError);
      }),
    );
  }
}
