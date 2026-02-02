import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RateLimitingService } from './rate-limiting.service';

@Injectable()
export class RateLimitingGuard implements CanActivate {
  constructor(private rateLimitingService: RateLimitingService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const ip = this.getClientIp(request);
    const userId = request.user?.userId;
    const endpoint = request.route?.path || request.path;
    const tier = request.user?.tier || 'free';

    const allowed = this.rateLimitingService.checkLimit(
      ip,
      userId,
      endpoint,
      tier,
    );

    const remaining = this.rateLimitingService.getRemainingRequests(
      ip,
      userId,
      endpoint,
      tier,
    );

    response.set('X-RateLimit-Remaining-Hourly', remaining.hourly.toString());
    response.set('X-RateLimit-Remaining-Daily', remaining.daily.toString());

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
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.connection.remoteAddress ||
      'unknown'
    );
  }
}
