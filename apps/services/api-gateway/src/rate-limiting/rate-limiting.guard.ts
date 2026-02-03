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
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const request: unknown = context.switchToHttp().getRequest();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const response: unknown = context.switchToHttp().getResponse();

      const ip: string = this.getClientIp(request as Record<string, unknown>);
      const userId: string | undefined = ((request as Record<string, unknown>).user as Record<string, string | undefined> | undefined)?.userId;
      const endpoint: string = (((request as Record<string, unknown>).route as Record<string, unknown> | undefined)?.path as string) || ((request as Record<string, unknown>).path as string);
      const tier: string = (((request as Record<string, unknown>).user as Record<string, string> | undefined)?.tier) || 'free';

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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      (response as any).set('X-RateLimit-Remaining-Hourly', remaining.hourly.toString());
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      (response as any).set('X-RateLimit-Remaining-Daily', remaining.daily.toString());

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
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private getClientIp(request: Record<string, unknown>): string {
    const forwardedFor: string | undefined = ((request.headers as Record<string, unknown>)?.['x-forwarded-for']) as string | undefined;
    const connection: Record<string, unknown> | undefined = (request.connection) as Record<string, unknown> | undefined;
    return (
      forwardedFor?.split(',')[0] ||
      (connection?.remoteAddress as string | undefined) ||
      'unknown'
    );
  }
}
