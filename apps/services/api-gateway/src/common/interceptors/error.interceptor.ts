import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiError } from '@patriotchat/shared';

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
          const apiError = new ApiError({
            status: 500,
            message: error.message,
            code: 'INTERNAL_ERROR',
            details: {
              originalError: error.name,
            },
          });
          return throwError(() => apiError);
        }

        // Unknown error format
        const unknownError = new ApiError({
          status: 500,
          message: 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR',
          details: { error },
        });
        return throwError(() => unknownError);
      }),
    );
  }
}
