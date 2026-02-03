import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RateLimitingService } from './rate-limiting.service';
import { getErrorMessage, AppException } from '../utils/error-handler';
import {
  isRequestLike,
  isResponseLike,
  getRecordProperty,
  getStringProperty,
  getStringFromRecord,
} from '../utils/type-guards';

@Injectable()
export class RateLimitingGuard implements CanActivate {
  constructor(private rateLimitingService: RateLimitingService) {}

   
  canActivate(context: ExecutionContext): boolean {
    try {
      // eslint-disable-next-line no-restricted-syntax,@typescript-eslint/no-explicit-any -- Runtime values from context require flexibility
      const requestValue: any = context.switchToHttp().getRequest();
      // eslint-disable-next-line no-restricted-syntax,@typescript-eslint/no-explicit-any -- Runtime values from context require flexibility
      const responseValue: any = context.switchToHttp().getResponse();

      if (!isRequestLike(requestValue) || !isResponseLike(responseValue)) {
        throw new AppException('Invalid request context');
      }

      const ip: string = this.getClientIp(requestValue as Record<string, unknown>);
      // eslint-disable-next-line no-restricted-syntax -- Type guards handle unknown safely
      const userRecord: Record<string, unknown> | undefined = getRecordProperty(requestValue as Record<string, unknown>, 'user');
      const userId: string | undefined = getStringFromRecord(userRecord, 'userId');
      // eslint-disable-next-line no-restricted-syntax -- Type guards handle unknown safely
      const routeRecord: Record<string, unknown> | undefined = getRecordProperty(requestValue as Record<string, unknown>, 'route');
      const endpoint: string = getStringProperty(routeRecord, 'path') || getStringProperty(requestValue as Record<string, unknown>, 'path') || 'unknown';
      const tier: string = getStringFromRecord(userRecord, 'tier') || 'free';

      const allowed: boolean = this.rateLimitingService.checkLimit(
        ip,
        userId,
        endpoint,
        tier,
      );

      const remaining: { hourly: number; daily: number } = this.rateLimitingService.getRemainingRequests(
        ip,
        userId,
        endpoint,
        tier,
      );

      if (typeof responseValue.set === 'function') {
        responseValue.set('X-RateLimit-Remaining-Hourly', remaining.hourly.toString());
        responseValue.set('X-RateLimit-Remaining-Daily', remaining.daily.toString());
      }

      if (!allowed) {
        throw new HttpException(
          {
            status: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Rate limit exceeded',
            remaining,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      return true;
    } catch (error: Error | AppException) {
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage: string = getErrorMessage(error);
      console.error('Rate limiting guard error:', errorMessage);
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getClientIp(request: Record<string, unknown>): string {
    const headersRecord: Record<string, unknown> | undefined = getRecordProperty(request, 'headers');
    const forwardedFor: string | undefined = getStringFromRecord(
      headersRecord,
      'x-forwarded-for',
    );
    const connectionRecord: Record<string, unknown> | undefined = getRecordProperty(request, 'connection');
    const remoteAddress: string | undefined = getStringFromRecord(connectionRecord, 'remoteAddress');
    const firstIp: string | undefined = forwardedFor?.split(',')[0]?.trim();

    return firstIp || remoteAddress || 'unknown';
  }
}
