import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface ServiceStatus {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy';
  lastCheck: number;
  responseTime: number;
}

export interface HealthCheckEvent {
  timestamp: number;
  services: ServiceStatus[];
}

export interface HealthCheckError {
  statusCode: number;
  message: string;
  error: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root',
})
export class WebSocketHealthService {
  private socket: Socket | null = null;
  private healthStatus$ = new Subject<HealthCheckEvent>();
  private healthError$ = new Subject<HealthCheckError>();
  private connected$ = new BehaviorSubject<boolean>(false);
  private socketUrl = 'http://localhost:3000';
  private socketNamespace = 'health';

  /**
   * Connect to health WebSocket and return observable of health events
   */
  connect(): Observable<HealthCheckEvent> {
    return new Observable((observer) => {
      if (this.socket?.connected) {
        this.subscribeToEvents(observer);
        return;
      }

      this.socket = io(`${this.socketUrl}/${this.socketNamespace}`, {
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('[WebSocketHealthService] Connected to health WebSocket');
        this.connected$.next(true);
      });

      this.socket.on('disconnect', () => {
        console.log('[WebSocketHealthService] Disconnected from health WebSocket');
        this.connected$.next(false);
      });

      this.socket.on('health-status', (event: HealthCheckEvent | HealthCheckError) => {
        try {
          if (this.isHealthCheckEvent(event)) {
            this.validateHealthCheckEvent(event);
            console.log('[WebSocketHealthService] Received health status:', event);
            observer.next(event);
            this.healthStatus$.next(event);
          } else if (this.isHealthCheckError(event)) {
            this.handleHealthCheckError(event);
          }
        } catch (validationError) {
          console.error('[WebSocketHealthService] DTO Validation failed:', validationError);
          this.handleDtoValidationError(validationError as Error);
        }
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('[WebSocketHealthService] Connection error:', error);
      });

      this.socket.on('error', (error: any) => {
        console.error('[WebSocketHealthService] Socket error:', error);
      });

      this.subscribeToEvents(observer);
    });
  }

  private subscribeToEvents(observer: any): void {
    if (!this.socket) return;

    // Handle events if socket is already connected
    if (this.socket.connected) {
      this.socket.on('health-status', (event: HealthCheckEvent | HealthCheckError) => {
        try {
          if (this.isHealthCheckEvent(event)) {
            this.validateHealthCheckEvent(event);
            observer.next(event);
            this.healthStatus$.next(event);
          } else if (this.isHealthCheckError(event)) {
            this.handleHealthCheckError(event);
          }
        } catch (validationError) {
          console.error('[WebSocketHealthService] DTO Validation failed:', validationError);
          this.handleDtoValidationError(validationError as Error);
        }
      });
    }
  }

  /**
   * Get error observable
   */
  getErrors(): Observable<HealthCheckError> {
    return this.healthError$.asObservable();
  }

  /**
   * Get connection status observable
   */
  getConnectionStatus(): Observable<boolean> {
    return this.connected$.asObservable();
  }

  /**
   * Request immediate health check from server
   */
  requestHealthCheck(): void {
    if (this.socket?.connected) {
      this.socket.emit('request-health-check');
      console.log('[WebSocketHealthService] Requested immediate health check');
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected$.next(false);
    }
  }


  /**
   * Type guard for HealthCheckEvent
   */
  private isHealthCheckEvent(event: any): event is HealthCheckEvent {
    return (
      event &&
      typeof event === 'object' &&
      'services' in event &&
      Array.isArray(event.services) &&
      'timestamp' in event &&
      typeof event.timestamp === 'number'
    );
  }

  /**
   * Type guard for HealthCheckError
   */
  private isHealthCheckError(event: any): event is HealthCheckError {
    return (
      event &&
      typeof event === 'object' &&
      'statusCode' in event &&
      'message' in event &&
      'error' in event
    );
  }

  /**
   * Validate HealthCheckEvent DTO structure
   */
  private validateHealthCheckEvent(event: HealthCheckEvent): void {
    if (!Number.isInteger(event.timestamp) || event.timestamp <= 0) {
      throw new Error('[DTO Validation] timestamp must be a positive integer');
    }

    if (!Array.isArray(event.services)) {
      throw new Error('[DTO Validation] services must be an array');
    }

    if (event.services.length === 0) {
      throw new Error('[DTO Validation] services array cannot be empty');
    }

    event.services.forEach((service, index) => {
      if (typeof service.name !== 'string' || !service.name) {
        throw new Error(`[DTO Validation] services[${index}].name must be a non-empty string`);
      }

      if (typeof service.url !== 'string' || !service.url) {
        throw new Error(`[DTO Validation] services[${index}].url must be a non-empty string`);
      }

      if (!['healthy', 'unhealthy'].includes(service.status)) {
        throw new Error(
          `[DTO Validation] services[${index}].status must be 'healthy' or 'unhealthy', got '${service.status}'`
        );
      }

      if (!Number.isInteger(service.lastCheck) || service.lastCheck <= 0) {
        throw new Error(
          `[DTO Validation] services[${index}].lastCheck must be a positive integer`
        );
      }

      if (!Number.isInteger(service.responseTime) || service.responseTime < 0) {
        throw new Error(
          `[DTO Validation] services[${index}].responseTime must be a non-negative integer`
        );
      }
    });
  }

  /**
   * Handle health check error from server
   */
  private handleHealthCheckError(error: HealthCheckError): void {
    console.error('[WebSocketHealthService] Server health check error:', error);
    this.healthError$.next(error);
  }

  /**
   * Handle DTO validation errors
   */
  private handleDtoValidationError(error: Error): void {
    const dtoError: HealthCheckError = {
      statusCode: 400,
      message: 'Invalid health check data format from server',
      error: error.message,
      timestamp: Date.now(),
    };
    this.healthError$.next(dtoError);
  }
}
