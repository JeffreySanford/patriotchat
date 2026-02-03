import { Injectable, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  TrackEventResponse,
  StatsResponse,
  ErrorResponse,
} from '../types/api.dto';

export interface AnalyticsEvent {
  userId: string;
  eventType: string;
  metadata?: Record<string, string | number | boolean>;
}

@Injectable()
export class AnalyticsService {
  private readonly analyticsServiceUrl: string =
    process.env.ANALYTICS_SERVICE_URL || 'http://localhost:4005';

  constructor(@Inject(HttpService) private readonly httpService: HttpService) {
    console.log(
      '[AnalyticsService] Constructor - HttpService available:',
      !!httpService,
    );
  }

  trackEvent(event: AnalyticsEvent): Observable<TrackEventResponse> {
    if (!event.userId) {
      console.warn(
        '[AnalyticsService] No userId provided, skipping event tracking',
      );
      return of({ status: 'skipped' });
    }

    const payload: Record<string, string> = {
      user_id: event.userId,
      event_type: event.eventType,
      metadata: event.metadata ? JSON.stringify(event.metadata) : '{}',
    };

    console.log('[AnalyticsService] Sending event to analytics service:', {
      url: `${this.analyticsServiceUrl}/analytics/track`,
      payload,
    });

    return this.httpService
      .post<TrackEventResponse>(
        `${this.analyticsServiceUrl}/analytics/track`,
        payload,
      )
      .pipe(
        tap((response: { status: number; data: TrackEventResponse }) => {
          console.log('[AnalyticsService] HTTP response received:', {
            status: response.status,
            data: response.data,
          });
        }),
        map((response: { data: TrackEventResponse }) => {
          console.log(
            '[AnalyticsService] Event tracked successfully:',
            response.data,
          );
          return response.data;
        }),
        catchError((error: Error | ErrorResponse) => {
          const errResponse: ErrorResponse = error as ErrorResponse;
          console.error(
            '[AnalyticsService] Failed to track event - full error:',
            {
              message: errResponse?.message,
              status: errResponse?.response?.status,
              data: errResponse?.response?.data,
            },
          );
          // Don't throw - return success fallback so analytics doesn't block the user
          return of({ status: 'tracked' });
        }),
      );
  }

  getStats(): Observable<StatsResponse> {
    return this.httpService
      .get<StatsResponse>(`${this.analyticsServiceUrl}/analytics/stats`)
      .pipe(
        map((response: { data: StatsResponse }) => response.data),
        catchError((error: Error | ErrorResponse) => {
          const errResponse: ErrorResponse = error as ErrorResponse;
          console.error('[AnalyticsService] Failed to get stats:', errResponse);
          const fallback: StatsResponse = {
            total_events: 0,
            active_users: 0,
            avg_latency: 0,
          };
          return of(fallback);
        }),
      );
  }
}
