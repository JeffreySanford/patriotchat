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
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        console.error('API Error:', error);

        if (error instanceof ApiError) {
          // Already an ApiError, just pass through
          return throwError(() => error);
        }

        if (error instanceof Error) {
          // Convert standard errors to ApiError
          const apiError = new ApiError(
            500,
            'INTERNAL_ERROR',
            {
              originalError: error.name,
            },
            error.message,
          );
          return throwError(() => apiError);
        }

        // Unknown error format
        const unknownError = new ApiError(
          500,
          'UNKNOWN_ERROR',
          { error },
          'An unexpected error occurred',
        );
        return throwError(() => unknownError);
      }),
    );
  }
}
