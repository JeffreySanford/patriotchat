import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Observable, interval, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import {
  HealthCheckEventDto,
  ServiceStatusDto,
  ErrorResponse,
} from './dto/health-check.dto';

type ExecAsyncType = (
  command: string,
  options?: { timeout?: number },
) => Promise<{ stdout: string; stderr: string }>;
const execAsync: ExecAsyncType = promisify(exec) as ExecAsyncType;

export interface ServiceConfig {
  name: string;
  url: string;
  dockerContainer?: string; // Docker container name to check
}

type HealthObserver = {
  next: (value: ServiceStatusDto) => void;
  complete: () => void;
  error?: (err: Error | ErrorResponse) => void;
};

@Injectable()
export class BackendHealthService {
  private readonly checkInterval: number = 30000; // 30 seconds
  private readonly timeout: number = 5000; // 5 second timeout per service
  private readonly logger: Logger = new Logger('BackendHealthService');

  private readonly services: ServiceConfig[] = [
    {
      name: 'Auth Service',
      url: 'http://localhost:4001/health',
      // Auth runs locally as Go process, not in Docker container
    },
    {
      name: 'LLM Service',
      url: 'http://localhost:11434/health',
      dockerContainer: 'patriotchat-ollama',
    },
    {
      name: 'Analytics Service',
      url: 'http://localhost:5000/health',
      dockerContainer: 'patriotchat-analytics',
    },
    {
      name: 'Policy Service',
      url: 'http://localhost:4006/health',
      dockerContainer: 'patriotchat-policy',
    },
    {
      name: 'Funding Service',
      url: 'http://localhost:4007/health',
      dockerContainer: 'patriotchat-funding',
    },
  ];

  private lastStatus: ServiceStatusDto[] = [];

  constructor(private http: HttpService) {
    this.logger.log(
      `Initialized with ${this.services.length} services to monitor`,
    );
  }

  /**
   * Get observable that emits strongly-typed health check events every 30 seconds
   */
  getHealthChecks(): Observable<HealthCheckEventDto> {
    return interval(this.checkInterval).pipe(
      switchMap(() => this.checkAllServices()),
      tap((services: ServiceStatusDto[]) => {
        this.lastStatus = services;
      }),
      map((services: ServiceStatusDto[]): HealthCheckEventDto => {
        const event: HealthCheckEventDto = {
          timestamp: Date.now(),
          services,
        };
        this.validateHealthCheckEvent(event);
        return event;
      }),
      catchError((error: Error | ErrorResponse) => {
        this.logger.error('Error in health check stream:', error);
        return of({
          timestamp: Date.now(),
          services: this.lastStatus,
        } as HealthCheckEventDto);
      }),
    );
  }

  /**
   * Check all services and return their status with strict typing
   */
  private checkAllServices(): Observable<ServiceStatusDto[]> {
    const checks: Observable<ServiceStatusDto>[] = this.services.map(
      (service: ServiceConfig) => this.checkService(service),
    );

    return forkJoin(checks).pipe(
      catchError((error: Error | ErrorResponse) => {
        this.logger.error('Error checking services:', error);
        return of(this.lastStatus);
      }),
    );
  }

  /**
   * Check individual service health (HTTP + optional Docker verification)
   */
  private checkService(config: ServiceConfig): Observable<ServiceStatusDto> {
    const startTime: number = Date.now();

    return new Observable<ServiceStatusDto>((observer: HealthObserver) => {
      // Start with HTTP health check
      this.checkHttpHealth(config.name, config.url, startTime)
        .then((status: ServiceStatusDto) => {
          // If HTTP check passed and Docker container is configured, verify it's running
          if (config.dockerContainer) {
            this.checkDockerContainer(config.dockerContainer)
              .then((isRunning: boolean) => {
                // If Docker container is not running, mark as unhealthy
                if (!isRunning) {
                  status.status = 'unhealthy';
                }
                observer.next(status);
                observer.complete();
              })
              .catch((error: Error | ErrorResponse) => {
                this.logger.debug(
                  `[${config.name}] Docker check failed (may be local process):`,
                  error,
                );
                // Service responded to HTTP, so trust that - Docker check is optional
                observer.next(status);
                observer.complete();
              });
          } else {
            // No Docker container configured for this service
            observer.next(status);
            observer.complete();
          }
        })
        .catch((): void => {
          // HTTP check failed - mark service as unhealthy
          const status: ServiceStatusDto = {
            name: config.name,
            url: config.url,
            status: 'unhealthy',
            lastCheck: Date.now(),
            responseTime: Math.min(Date.now() - startTime, this.timeout),
          };
          this.validateServiceStatus(status);
          observer.next(status);
          observer.complete();
        });
    });
  }

  /**
   * Check HTTP endpoint health
   */
  private async checkHttpHealth(
    name: string,
    url: string,
    startTime: number,
  ): Promise<ServiceStatusDto> {
    try {
      await this.http.get(url, { timeout: this.timeout }).toPromise();

      const status: ServiceStatusDto = {
        name,
        url,
        status: 'healthy',
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
      };
      this.validateServiceStatus(status);
      return status;
      // eslint-disable-next-line no-restricted-syntax
    } catch (error: unknown) {
      this.logger.warn(`[${name}] HTTP health check failed`);
      throw error;
    }
  }

  /**
   * Check if Docker container is running
   */
  private async checkDockerContainer(containerName: string): Promise<boolean> {
    try {
      const result: { stdout: string; stderr: string } = await execAsync(
        `docker inspect --format='{{.State.Running}}' ${containerName}`,
        { timeout: 5000 },
      );
      const isRunning: boolean = result.stdout.trim().toLowerCase() === 'true';
      this.logger.debug(
        `[Docker] Container ${containerName}: ${isRunning ? 'running' : 'stopped'}`,
      );
      return isRunning;
      // eslint-disable-next-line no-restricted-syntax
    } catch (error: unknown) {
      this.logger.error(
        `[Docker] Failed to check container ${containerName}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Validate service status DTO
   */
  private validateServiceStatus(status: ServiceStatusDto): void {
    if (!status.name || typeof status.name !== 'string') {
      throw new Error(
        '[DTO Validation] ServiceStatus: name must be a non-empty string',
      );
    }
    if (!status.url || typeof status.url !== 'string') {
      throw new Error(
        '[DTO Validation] ServiceStatus: url must be a non-empty string',
      );
    }
    if (!['healthy', 'unhealthy'].includes(status.status)) {
      throw new Error(
        `[DTO Validation] ServiceStatus: status must be 'healthy' or 'unhealthy', got '${status.status}'`,
      );
    }
    if (!Number.isInteger(status.lastCheck) || status.lastCheck <= 0) {
      throw new Error(
        '[DTO Validation] ServiceStatus: lastCheck must be a positive integer',
      );
    }
    if (!Number.isInteger(status.responseTime) || status.responseTime < 0) {
      throw new Error(
        '[DTO Validation] ServiceStatus: responseTime must be a non-negative integer',
      );
    }
  }

  /**
   * Validate complete health check event DTO
   */
  private validateHealthCheckEvent(event: HealthCheckEventDto): void {
    if (!Number.isInteger(event.timestamp) || event.timestamp <= 0) {
      throw new Error(
        '[DTO Validation] HealthCheckEvent: timestamp must be a positive integer',
      );
    }
    if (!Array.isArray(event.services)) {
      throw new Error(
        '[DTO Validation] HealthCheckEvent: services must be an array',
      );
    }
    if (event.services.length === 0) {
      throw new Error(
        '[DTO Validation] HealthCheckEvent: services array cannot be empty',
      );
    }
    event.services.forEach((service: ServiceStatusDto, index: number) => {
      try {
        this.validateServiceStatus(service);
        // eslint-disable-next-line no-restricted-syntax
      } catch (error: unknown) {
        const errorMessage: string =
          error instanceof Error ? error.message : String(error);
        throw new Error(
          `[DTO Validation] HealthCheckEvent services[${index}]: ${errorMessage}`,
        );
      }
    });
  }
}
