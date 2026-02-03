import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  TrackEventRequest,
  TrackEventResponse,
  StatsResponse,
  ErrorResponse,
} from '../types/api.dto';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AuthenticatedRequest {
  user: {
    id: string;
    sub?: string;
  };
}

@Controller('analytics')
export class AnalyticsController {
  constructor(
    @Inject(AnalyticsService)
    private readonly analyticsService: AnalyticsService,
  ) {
    console.log('[AnalyticsController] Constructor called');
    console.log(
      '[AnalyticsController] Service type:',
      typeof this.analyticsService,
    );
    console.log(
      '[AnalyticsController] Service is:',
      this.analyticsService?.constructor?.name,
    );
  }

  @Post('track')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  trackEvent(
    @Body() body: TrackEventRequest,
    @Req() req: AuthenticatedRequest,
  ): Observable<TrackEventResponse> {
    console.log(
      '[AnalyticsController] trackEvent called, service available:',
      !!this.analyticsService,
    );

    const userId: string = req.user?.id || req.user?.sub || 'unknown-user';

    console.log('[AnalyticsController] Extracted userId:', userId);
    console.log('[AnalyticsController] Request body:', body);

    return this.analyticsService
      .trackEvent({
        userId,
        eventType: body.eventType,
        metadata: body.metadata,
      })
      .pipe(
        tap((result: TrackEventResponse) => {
          console.log(
            '[AnalyticsController] Event tracked successfully:',
            result,
          );
        }),
        catchError((error: Error | ErrorResponse) => {
          const errResponse: ErrorResponse = error as ErrorResponse;
          console.error('[AnalyticsController] Error tracking event:', {
            message: errResponse?.message,
            status: errResponse?.response?.status,
            data: errResponse?.response?.data,
            stack: errResponse?.message,
          });
          // Return success anyway - analytics shouldn't block the user
          return of({ status: 'tracked' });
        }),
      );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(): Observable<StatsResponse> {
    return this.analyticsService.getStats().pipe(
      tap((): void => {
        console.log('[AnalyticsController] Stats retrieved');
      }),
      catchError((error: Error | ErrorResponse) => {
        const errResponse: ErrorResponse = error as ErrorResponse;
        console.error(
          '[AnalyticsController] Error getting stats:',
          errResponse,
        );
        const fallbackStats: StatsResponse = {
          total_events: 0,
          active_users: 0,
          avg_latency: 0,
        };
        return of(fallbackStats);
      }),
    );
  }
}
