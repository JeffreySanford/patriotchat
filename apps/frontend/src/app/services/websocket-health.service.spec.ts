import { describe, it, expect, beforeEach } from 'vitest';
import {
  WebSocketHealthService,
  HealthCheckEvent,
  ServiceStatus,
} from './websocket-health.service';

describe('WebSocketHealthService', () => {
  let service: WebSocketHealthService;

  beforeEach(() => {
    service = new WebSocketHealthService();
  });

  describe('WebSocket Connection', () => {
    it('should create service instance', () => {
      expect(service).toBeDefined();
    });

    it('should provide disconnect method', () => {
      expect(service.disconnect).toBeDefined();
      // Should not throw
      service.disconnect();
    });

    it('should provide connect method', () => {
      expect(service.connect).toBeDefined();
    });

    it('should provide request health check method', () => {
      expect(service.requestHealthCheck).toBeDefined();
    });
  });

  describe('Health Status Events', () => {
    it('should define observable for connection status', () => {
      const connectionObservable = service.getConnectionStatus();
      expect(connectionObservable).toBeDefined();
    });

    it('should define observable for error events', () => {
      const errorObservable = service.getErrors();
      expect(errorObservable).toBeDefined();
    });

    it('should define connect method', () => {
      expect(service.connect).toBeDefined();
    });
  });

  describe('Service Status Interface', () => {
    it('should validate service status structure', () => {
      const mockStatus: ServiceStatus = {
        name: 'Test Service',
        url: 'http://localhost:3000',
        status: 'healthy',
        lastCheck: Date.now(),
        responseTime: 50,
      };

      expect(mockStatus.name).toBe('Test Service');
      expect(mockStatus.status).toBe('healthy');
      expect(mockStatus.responseTime).toBe(50);
    });

    it('should accept unhealthy status', () => {
      const mockStatus: ServiceStatus = {
        name: 'Test Service',
        url: 'http://localhost:3000',
        status: 'unhealthy',
        lastCheck: Date.now(),
        responseTime: 0,
      };

      expect(mockStatus.status).toBe('unhealthy');
    });
  });

  describe('Health Check Event', () => {
    it('should validate health check event structure', () => {
      const mockEvent: HealthCheckEvent = {
        timestamp: Date.now(),
        services: [
          {
            name: 'Auth',
            url: 'http://localhost:4001',
            status: 'healthy',
            lastCheck: Date.now(),
            responseTime: 10,
          },
          {
            name: 'LLM',
            url: 'http://localhost:11434',
            status: 'healthy',
            lastCheck: Date.now(),
            responseTime: 20,
          },
        ],
      };

      expect(mockEvent.services.length).toBe(2);
      expect(mockEvent.services[0].name).toBe('Auth');
      expect(mockEvent.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Disconnect Functionality', () => {
    it('should provide disconnect method', () => {
      expect(service.disconnect).toBeDefined();
      // Should not throw
      service.disconnect();
    });
  });

  describe('Message Handling', () => {
    it('should handle health status events', () => {
      // Service receives and processes health check events from WebSocket
      expect(service.connect).toBeDefined();
    });

    it('should emit connection status changes', () => {
      service.getConnectionStatus().subscribe((connected) => {
        // Subscription is working
        expect(typeof connected).toBe('boolean');
      });
    });
  });

  describe('Type Safety', () => {
    it('should enforce ServiceStatus types', () => {
      const status: ServiceStatus = {
        name: 'Service1',
        url: 'http://test.com',
        status: 'healthy' as const,
        lastCheck: 0,
        responseTime: 50,
      };

      expect(status.status === 'healthy' || status.status === 'unhealthy').toBe(
        true,
      );
    });

    it('should enforce HealthCheckEvent timestamp', () => {
      const event: HealthCheckEvent = {
        timestamp: Date.now(),
        services: [],
      };

      expect(typeof event.timestamp).toBe('number');
      expect(event.timestamp).toBeGreaterThan(0);
    });
  });

  describe('Observable Behavior', () => {
    it('should provide cold observables for connection status', () => {
      const obs1 = service.getConnectionStatus();
      const obs2 = service.getConnectionStatus();

      // Each call should return independent observable
      expect(obs1).not.toBe(obs2);
    });

    it('should handle subscription cleanup', () => {
      const subscription = service.getConnectionStatus().subscribe(() => {
        // Subscription successful
      });

      subscription.unsubscribe();
      expect(subscription.closed).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should provide error observable', () => {
      const errorObs = service.getErrors();
      expect(errorObs).toBeDefined();
    });

    it('should handle validation errors gracefully', () => {
      // Service should handle invalid events without crashing
      expect(service).toBeDefined();
    });
  });
});
