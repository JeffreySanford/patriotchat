import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Response } from 'express';

/**
 * Backend Response Interceptor
 * Wraps all responses in ApiResponse format
 * Ensures consistent response structure
 */
@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, { data: T; timestamp: number; status: number }>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<{ data: T; timestamp: number; status: number }> {
    const response: Response = context.switchToHttp().getResponse();
    const status: number = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((data: T) => ({
        data,
        timestamp: Date.now(),
        status,
      })),
    );
  }
}
