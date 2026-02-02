import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface QueryResponse {
  response: string;
  latencyMs?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LlmQueryService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly baseUrl: string = this.buildBaseUrl();

  query(prompt: string): Observable<QueryResponse> {
    console.log('[LlmQueryService] Sending query:', { prompt, baseUrl: this.baseUrl });
    return this.http.post<QueryResponse>(`${this.baseUrl}/query`, { prompt }).pipe(
      tap((response: QueryResponse): void => {
        console.log('[LlmQueryService] Query response received:', response);
        if (!response.latencyMs) {
          console.warn('[LlmQueryService] ⚠️ No latencyMs in response! Progress metric missing.');
        }
      }),
      catchError((error: Error): Observable<never> => {
        console.error('[LlmQueryService] Query failed:', error);
        throw error;
      }),
    );
  }

  private buildBaseUrl(): string {
    const customUrl: string | undefined = (window as typeof window & {
      PATRIOTCHAT_API_URL?: string;
    }).PATRIOTCHAT_API_URL;
    if (typeof customUrl === 'string' && customUrl.trim().length > 0) {
      return customUrl.trim();
    }
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3000/api`;
  }
}
