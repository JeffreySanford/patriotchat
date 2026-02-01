import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface QueryResponse {
  response: string;
  latencyMs?: number;
}

@Injectable({
  providedIn: 'root',
})
export class LlmQueryService {
  private readonly http: HttpClient = inject(HttpClient) as HttpClient;
  private readonly baseUrl: string = this.buildBaseUrl();

  query(prompt: string): Observable<QueryResponse> {
    return this.http.post<QueryResponse>(`${this.baseUrl}/query`, { prompt });
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
