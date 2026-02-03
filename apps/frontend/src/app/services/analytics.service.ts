import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AnalyticsEvent {
  eventType: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface TrackResponse {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly API_URL: string = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  trackEvent(
    eventType: string,
    metadata?: Record<string, string | number | boolean>,
  ): Observable<TrackResponse> {
    const event: AnalyticsEvent = {
      eventType,
      metadata,
    };
    return this.http.post<TrackResponse>(
      `${this.API_URL}/analytics/track`,
      event,
    );
  }
}
