import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  timestamp: number;
  icon: string;
}

export interface HealthCheckResponse {
  services: ServiceHealth[];
  lastCheck: number;
}

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private readonly apiBaseUrl = 'http://localhost:3000';
  private readonly pollInterval = 30000; // 30 seconds

  private readonly serviceEndpoints: Map<string, string> = new Map([
    ['API Gateway', `${this.apiBaseUrl}/health`],
    ['Auth Service', `${this.apiBaseUrl}/auth/validate`],
    ['Inference Service', `${this.apiBaseUrl}/inference/models`],
    ['Analytics Service', `${this.apiBaseUrl}/analytics/stats`],
  ]);

  constructor(private http: HttpClient) {}

  /**
   * Check health of all services
   */
  checkAllServices(): Observable<ServiceHealth[]> {
    const healthChecks = Array.from(this.serviceEndpoints.entries()).map(
      ([name, endpoint]) => this.checkService(name, endpoint)
    );
    return forkJoin(healthChecks).pipe(
      catchError((error) => {
        console.error('[HealthService] forkJoin error:', error);
        return of([]);
      })
    );
  }

  /**
   * Check individual service health
   */
  private checkService(name: string, endpoint: string): Observable<ServiceHealth> {
    return this.http
      .get(endpoint, { timeout: 5000 })
      .pipe(
        map(() => ({
          name,
          status: 'healthy' as const,
          timestamp: Date.now(),
          icon: '✓',
        })),
        catchError(() => {
          return of({
            name,
            status: 'unhealthy' as const,
            timestamp: Date.now(),
            icon: '✗',
          });
        })
      );
  }

  /**
   * Get icon for service status
   */
  getStatusIcon(status: string): string {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'unhealthy':
        return '✗';
      default:
        return '?';
    }
  }

  /**
   * Get CSS class for status
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'healthy':
        return 'status-healthy';
      case 'unhealthy':
        return 'status-unhealthy';
      default:
        return 'status-unknown';
    }
  }
}
