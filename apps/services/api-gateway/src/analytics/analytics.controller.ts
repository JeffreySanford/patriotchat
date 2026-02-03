import { Controller, Post, Get, Body, UseGuards, Req, HttpCode, Inject } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface TrackEventRequest {
  eventType: string;
  metadata?: Record<string, unknown>;
}

export interface TrackEventResponse {
  status: string;
}

@Controller('analytics')
export class AnalyticsController {
  constructor(@Inject(AnalyticsService) private readonly analyticsService: AnalyticsService) {
    console.log('[AnalyticsController] Constructor called');
    console.log('[AnalyticsController] Service type:', typeof this.analyticsService);
    console.log('[AnalyticsController] Service is:', this.analyticsService?.constructor?.name);
  }

  @Post('track')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  trackEvent(
    @Body() body: TrackEventRequest,
    @Req() req: any,
  ): Observable<TrackEventResponse> {
    console.log('[AnalyticsController] trackEvent called, service available:', !!this.analyticsService);
    
    const userId = req.user?.id || req.user?.sub || 'unknown-user';
    
    console.log('[AnalyticsController] Extracted userId:', userId);
    console.log('[AnalyticsController] Request body:', body);
    
    return this.analyticsService.trackEvent({
      userId,
      eventType: body.eventType,
      metadata: body.metadata,
    }).pipe(
      tap((result) => {
        console.log('[AnalyticsController] Event tracked successfully:', result);
      }),
      catchError((error: any) => {
        console.error('[AnalyticsController] Error tracking event:', {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
          stack: error?.stack,
        });
        // Return success anyway - analytics shouldn't block the user
        return of({ status: 'tracked' });
      }),
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  getStats(): Observable<Record<string, unknown>> {
    return this.analyticsService.getStats().pipe(
      tap(() => {
        console.log('[AnalyticsController] Stats retrieved');
      }),
      catchError((error: any) => {
        console.error('[AnalyticsController] Error getting stats:', error);
        return of({
          total_events: 0,
          active_users: 0,
          avg_latency: 0,
        });
      }),
    );
  }
}
