import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketHealthService, HealthCheckEvent, HealthCheckError } from '../../services/websocket-health.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: false,
})
export class FooterComponent implements OnInit, OnDestroy {
  services: any[] = [];
  isAuthenticated = false;
  isLoading = false;
  lastCheckTime: number = 0;
  wsConnected = false;
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private wsHealthService: WebSocketHealthService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state
    this.authService.isAuthenticated$?.pipe(takeUntil(this.destroy$)).subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.connectWebSocket();
      } else {
        this.disconnectWebSocket();
      }
    });
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private connectWebSocket(): void {
    console.log('[FooterComponent] Connecting to WebSocket health service');
    this.errorMessage = '';

    // Subscribe to connection status
    this.wsHealthService
      .getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe((connected) => {
        this.wsConnected = connected;
      });

    // Subscribe to health status
    this.wsHealthService
      .connect()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (event: HealthCheckEvent) => {
          this.services = event.services;
          this.lastCheckTime = event.timestamp;
          this.isLoading = false;
          this.errorMessage = '';
        },
        error: (error: any) => {
          console.error('[FooterComponent] WebSocket connection error:', error);
          this.wsConnected = false;
          this.isLoading = false;
          this.errorMessage = 'Unable to connect to health monitoring';
        },
      });

    // Subscribe to error events
    this.wsHealthService
      .getErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (error: HealthCheckError) => {
          console.error('[FooterComponent] Health check error received:', error);
          this.errorMessage = `${error.message}: ${error.error}`;
        },
      });
  }

  private disconnectWebSocket(): void {
    console.log('[FooterComponent] Disconnecting from WebSocket health service');
    this.wsHealthService.disconnect();
    this.wsConnected = false;
  }

  requestHealthCheck(): void {
    console.log('[FooterComponent] Requesting immediate health check');
    this.wsHealthService.requestHealthCheck();
  }

  getStatusIcon(status: string): string {
    return status === 'healthy' ? '✓' : '✗';
  }

  getStatusClass(status: string): string {
    return status === 'healthy' ? 'status-healthy' : 'status-unhealthy';
  }

  getServiceIcon(serviceName: string): string {
    const iconMap: { [key: string]: string } = {
      'Auth Service': '🔐',
      'LLM Service': '🧠',
      'Analytics Service': '📊',
      'Policy Service': '⚖️',
      'Funding Service': '💰',
    };
    return iconMap[serviceName] || '⚙️';
  }

  getTimeAgo(timestamp: number): string {
    if (!timestamp) return 'never';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}
