import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface AnalyticsEvent {
  userId: string;
  eventType: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AnalyticsService {
  private analyticsServiceUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4005';

  constructor(@Inject(HttpService) private readonly httpService: HttpService) {
    console.log('[AnalyticsService] Constructor - HttpService available:', !!httpService);
  }

  trackEvent(event: AnalyticsEvent): Observable<{ status: string }> {
    if (!event.userId) {
      console.warn('[AnalyticsService] No userId provided, skipping event tracking');
      return of({ status: 'skipped' });
    }

    const payload = {
      user_id: event.userId,
      event_type: event.eventType,
      metadata: event.metadata ? JSON.stringify(event.metadata) : '{}',
    };

    console.log('[AnalyticsService] Sending event to analytics service:', {
      url: `${this.analyticsServiceUrl}/analytics/track`,
      payload,
    });

    return this.httpService
      .post<{ status: string }>(`${this.analyticsServiceUrl}/analytics/track`, payload)
      .pipe(
        tap((response) => {
          console.log('[AnalyticsService] HTTP response received:', {
            status: response.status,
            statusText: response.statusText,
            data: response.data,
          });
        }),
        map((response) => {
          console.log('[AnalyticsService] Event tracked successfully:', response.data);
          return response.data;
        }),
        catchError((error: any) => {
          console.error('[AnalyticsService] Failed to track event - full error:', {
            message: error?.message,
            code: error?.code,
            status: error?.status,
            statusText: error?.statusText,
            response: error?.response,
            config: error?.config,
          });
          // Don't throw - return success fallback so analytics doesn't block the user
          return of({ status: 'tracked' });
        }),
      );
  }

  getStats(): Observable<Record<string, unknown>> {
    return this.httpService
      .get<Record<string, unknown>>(`${this.analyticsServiceUrl}/analytics/stats`)
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          console.error('[AnalyticsService] Failed to get stats:', error);
          return of({
            total_events: 0,
            active_users: 0,
            avg_latency: 0,
          });
        }),
      );
  }
}
