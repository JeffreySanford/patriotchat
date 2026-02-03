import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BackendHealthService } from './backend-health.service';
import { HealthCheckEventDto, HealthCheckErrorDto } from './dto/health-check.dto';
import { Subscription } from 'rxjs';
import { Logger, Injectable, Inject } from '@nestjs/common';

@Injectable()
@WebSocketGateway({
  namespace: 'health',
  cors: {
    origin: '*',
  },
})
export class HealthGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private healthCheckSubscription: Subscription | null = null;
  private connectedClients = new Set<string>();
  private readonly logger = new Logger('HealthGateway');
  private initialized = false;

  constructor(@Inject(BackendHealthService) private readonly backendHealthService: BackendHealthService) {}

  onModuleInit(): void {
    this.logger.log('HealthGateway module initialized');
    if (!this.backendHealthService) {
      this.logger.warn('BackendHealthService not available during module init');
    } else {
      this.initialized = true;
    }
  }

  afterInit(server: Server): void {
    this.logger.log('WebSocket Gateway initialized on namespace /health');
    if (!this.initialized && this.backendHealthService) {
      this.initialized = true;
      // Start health checks in afterInit when all services are ready
      this.logger.log('All services initialized, starting health checks');
      this.startHealthChecks();
    }
  }

  /**
   * Start continuous health checks and broadcast to all connected clients
   */
  private startHealthChecks(): void {
    if (!this.backendHealthService) {
      this.logger.error('BackendHealthService is undefined, cannot start health checks');
      return;
    }

    this.logger.log('Starting health checks subscription...');
    this.healthCheckSubscription = this.backendHealthService
      .getHealthChecks()
      .subscribe({
        next: (event: HealthCheckEventDto) => {
          try {
            // Validate DTO before broadcasting
            this.validateHealthCheckEvent(event);

            if (this.connectedClients.size > 0) {
              this.logger.debug(
                `Broadcasting health status to ${this.connectedClients.size} clients`
              );
              this.server.emit('health-status', event);
            }
          } catch (error) {
            this.handleDtoValidationError(error);
          }
        },
        error: (error) => {
          this.logger.error('Health check stream error:', error);
          this.broadcastError({
            statusCode: 500,
            message: 'Health check service error',
            error: error?.message || 'Unknown error',
            timestamp: Date.now(),
          });

          // Reconnect on error
          if (this.healthCheckSubscription) {
            this.healthCheckSubscription.unsubscribe();
          }
          setTimeout(() => this.startHealthChecks(), 5000);
        },
      });
  }

  /**
   * Handle new client connections
   */
  handleConnection(client: Socket): void {
    this.connectedClients.add(client.id);
    this.logger.log(
      `Client connected: ${client.id}, total connected: ${this.connectedClients.size}`
    );

    // Health checks already started in afterInit, clients will receive updates automatically
  }

  /**
   * Handle client disconnections
   */
  handleDisconnect(client: Socket): void {
    this.connectedClients.delete(client.id);
    this.logger.log(
      `Client disconnected: ${client.id}, total connected: ${this.connectedClients.size}`
    );

    // Stop checks if no clients connected
    if (this.connectedClients.size === 0 && this.healthCheckSubscription) {
      this.logger.log('No clients connected, stopping health checks');
      this.healthCheckSubscription.unsubscribe();
    }
  }

  /**
   * Client can request immediate health check
   */
  @SubscribeMessage('request-health-check')
  requestHealthCheck(client: Socket): void {
    this.logger.log(`Health check requested by client: ${client.id}`);
    // Health checks will emit automatically, no need to do anything
  }

  /**
   * Validate HealthCheckEventDto structure and types
   */
  private validateHealthCheckEvent(event: any): void {
    if (!event || typeof event !== 'object') {
      throw new Error('[DTO Validation] Event must be an object');
    }

    if (!Number.isInteger(event.timestamp) || event.timestamp <= 0) {
      throw new Error('[DTO Validation] timestamp must be a positive integer');
    }

    if (!Array.isArray(event.services)) {
      throw new Error('[DTO Validation] services must be an array');
    }

    if (event.services.length === 0) {
      throw new Error('[DTO Validation] services array cannot be empty');
    }

    event.services.forEach((service: any, index: number) => {
      if (!service || typeof service !== 'object') {
        throw new Error(`[DTO Validation] services[${index}] must be an object`);
      }

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
   * Handle DTO validation errors
   */
  private handleDtoValidationError(error: any): void {
    this.logger.error('DTO Validation Error:', error.message);
    this.broadcastError({
      statusCode: 400,
      message: 'Invalid health check data format',
      error: error?.message || 'DTO validation failed',
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast error to all connected clients
   */
  private broadcastError(errorDto: HealthCheckErrorDto): void {
    this.server.emit('health-error', errorDto);
  }

  /**
   * Graceful shutdown
   */
  onModuleDestroy(): void {
    this.logger.log('Shutting down HealthGateway...');
    if (this.healthCheckSubscription) {
      this.healthCheckSubscription.unsubscribe();
    }
    this.connectedClients.clear();
  }
}
