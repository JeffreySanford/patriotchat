import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Observable, interval, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { HealthCheckEventDto, ServiceStatusDto } from './dto/health-check.dto';

const execAsync = promisify(exec);

export interface ServiceConfig {
  name: string;
  url: string;
  dockerContainer?: string; // Docker container name to check
}

@Injectable()
export class BackendHealthService {
  private readonly checkInterval = 30000; // 30 seconds
  private readonly timeout = 5000; // 5 second timeout per service
  private readonly logger = new Logger('BackendHealthService');

  private readonly services: ServiceConfig[] = [
    { 
      name: 'Auth Service', 
      url: 'http://localhost:4001/health',
      dockerContainer: 'patriotchat-auth'
    },
    { 
      name: 'LLM Service', 
      url: 'http://localhost:5000/health',
      dockerContainer: 'patriotchat-ollama'
    },
    { 
      name: 'Analytics Service', 
      url: 'http://localhost:4005/health',
      dockerContainer: 'patriotchat-analytics'
    },
    { 
      name: 'Policy Service', 
      url: 'http://localhost:4006/health',
      dockerContainer: 'patriotchat-policy'
    },
    { 
      name: 'Funding Service', 
      url: 'http://localhost:4007/health',
      dockerContainer: 'patriotchat-funding'
    },
  ];

  private lastStatus: ServiceStatusDto[] = [];

  constructor(private http: HttpService) {
    this.logger.log(`Initialized with ${this.services.length} services to monitor`);
  }

  /**
   * Get observable that emits strongly-typed health check events every 30 seconds
   */
  getHealthChecks(): Observable<HealthCheckEventDto> {
    return interval(this.checkInterval).pipe(
      switchMap(() => this.checkAllServices()),
      tap((services) => {
        this.lastStatus = services;
      }),
      map((services): HealthCheckEventDto => {
        const event: HealthCheckEventDto = {
          timestamp: Date.now(),
          services,
        };
        this.validateHealthCheckEvent(event);
        return event;
      }),
      catchError((error) => {
        this.logger.error('Error in health check stream:', error);
        return of({
          timestamp: Date.now(),
          services: this.lastStatus,
        } as HealthCheckEventDto);
      })
    );
  }

  /**
   * Check all services and return their status with strict typing
   */
  private checkAllServices(): Observable<ServiceStatusDto[]> {
    const checks = this.services.map((service) =>
      this.checkService(service)
    );

    return forkJoin(checks).pipe(
      catchError((error) => {
        this.logger.error('Error checking services:', error);
        return of(this.lastStatus);
      })
    );
  }

  /**
   * Check individual service health (HTTP + Docker)
   */
  private checkService(config: ServiceConfig): Observable<ServiceStatusDto> {
    const startTime = Date.now();

    return new Observable((observer) => {
      // Start with HTTP health check
      this.checkHttpHealth(config.name, config.url, startTime)
        .then((status) => {
          // If HTTP check passed, also verify Docker container if configured
          if (config.dockerContainer) {
            this.checkDockerContainer(config.dockerContainer)
              .then((isRunning) => {
                // If Docker is not running but HTTP passed, mark as unhealthy
                if (!isRunning) {
                  status.status = 'unhealthy';
                }
                observer.next(status);
                observer.complete();
              })
              .catch((error) => {
                this.logger.warn(
                  `[${config.name}] Docker check failed, trusting HTTP check:`,
                  error
                );
                observer.next(status);
                observer.complete();
              });
          } else {
            observer.next(status);
            observer.complete();
          }
        })
        .catch((httpError) => {
          // HTTP check failed, try Docker check to see if container exists but is unhealthy
          if (config.dockerContainer) {
            this.checkDockerContainer(config.dockerContainer)
              .then((isRunning) => {
                const status: ServiceStatusDto = {
                  name: config.name,
                  url: config.url,
                  status: isRunning ? 'unhealthy' : 'unhealthy',
                  lastCheck: Date.now(),
                  responseTime: Math.min(Date.now() - startTime, this.timeout),
                };
                this.validateServiceStatus(status);
                observer.next(status);
                observer.complete();
              })
              .catch(() => {
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
          } else {
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
          }
        });
    });
  }

  /**
   * Check HTTP endpoint health
   */
  private async checkHttpHealth(
    name: string,
    url: string,
    startTime: number
  ): Promise<ServiceStatusDto> {
    try {
      await this.http
        .get(url, { timeout: this.timeout })
        .toPromise();

      const status: ServiceStatusDto = {
        name,
        url,
        status: 'healthy',
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
      };
      this.validateServiceStatus(status);
      return status;
    } catch (error) {
      this.logger.warn(`[${name}] HTTP health check failed`);
      throw error;
    }
  }

  /**
   * Check if Docker container is running
   */
  private async checkDockerContainer(containerName: string): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `docker inspect --format='{{.State.Running}}' ${containerName}`,
        { timeout: 5000 }
      );
      const isRunning = stdout.trim().toLowerCase() === 'true';
      this.logger.debug(`[Docker] Container ${containerName}: ${isRunning ? 'running' : 'stopped'}`);
      return isRunning;
    } catch (error) {
      this.logger.error(`[Docker] Failed to check container ${containerName}:`, error);
      throw error;
    }
  }

  /**
   * Validate service status DTO
   */
  private validateServiceStatus(status: ServiceStatusDto): void {
    if (!status.name || typeof status.name !== 'string') {
      throw new Error('[DTO Validation] ServiceStatus: name must be a non-empty string');
    }
    if (!status.url || typeof status.url !== 'string') {
      throw new Error('[DTO Validation] ServiceStatus: url must be a non-empty string');
    }
    if (!['healthy', 'unhealthy'].includes(status.status)) {
      throw new Error(
        `[DTO Validation] ServiceStatus: status must be 'healthy' or 'unhealthy', got '${status.status}'`
      );
    }
    if (!Number.isInteger(status.lastCheck) || status.lastCheck <= 0) {
      throw new Error('[DTO Validation] ServiceStatus: lastCheck must be a positive integer');
    }
    if (!Number.isInteger(status.responseTime) || status.responseTime < 0) {
      throw new Error('[DTO Validation] ServiceStatus: responseTime must be a non-negative integer');
    }
  }

  /**
   * Validate complete health check event DTO
   */
  private validateHealthCheckEvent(event: HealthCheckEventDto): void {
    if (!Number.isInteger(event.timestamp) || event.timestamp <= 0) {
      throw new Error('[DTO Validation] HealthCheckEvent: timestamp must be a positive integer');
    }
    if (!Array.isArray(event.services)) {
      throw new Error('[DTO Validation] HealthCheckEvent: services must be an array');
    }
    if (event.services.length === 0) {
      throw new Error('[DTO Validation] HealthCheckEvent: services array cannot be empty');
    }
    event.services.forEach((service, index) => {
      try {
        this.validateServiceStatus(service);
      } catch (error) {
        throw new Error(`[DTO Validation] HealthCheckEvent services[${index}]: ${(error as Error).message}`);
      }
    });
  }
}

