import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface AnalyticsEvent {
  user_id: string;
  event_type: string;
  metadata: string;
}

export interface TrackResponse {
  success: boolean;
  message?: string;
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
    metadata: Record<string, string | number | boolean>,
  ): Observable<TrackResponse> {
    const token: string | null = this.authService.getToken();
    const event: AnalyticsEvent = {
      user_id: 'current-user',
      event_type: eventType,
      metadata: JSON.stringify(metadata),
    };
    return this.http.post<TrackResponse>(
      `${this.API_URL}/analytics/track`,
      event,
      {
        headers: { Authorization: `Bearer ${token || ''}` },
      },
    );
  }
}
