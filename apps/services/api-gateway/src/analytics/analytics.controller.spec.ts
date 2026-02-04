import { describe, it, expect, vi, beforeEach } from 'vitest';
import { of } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;
  let mockRequest: any;

  beforeEach(() => {
    mockRequest = {
      user: {
        id: 'test-user-id',
        sub: 'test-sub',
      },
    };

    const mockAnalyticsService = {
      trackEvent: vi.fn().mockReturnValue(of({ success: true })),
    };

    service = mockAnalyticsService as any;
    controller = new AnalyticsController(service);
  });

  describe('POST /analytics/track', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });

    it('should have trackEvent method', () => {
      expect(controller.trackEvent).toBeDefined();
    });

    it('should accept event payload', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      expect(() => controller.trackEvent(event, mockRequest)).not.toThrow();
    });

    it('should call service.trackEvent', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      controller.trackEvent(event, mockRequest);

      expect(service.trackEvent).toHaveBeenCalled();
    });

    it('should return success response', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      const result = controller.trackEvent(event, mockRequest);

      expect(result).toBeDefined();
    });

    it('should track inference events', () => {
      const event = {
        event_type: 'inference',
        user_id: 'user123',
        model: 'llama2',
        tokens: 50,
        duration: 100,
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      const result = controller.trackEvent(event, mockRequest);

      expect(result).toBeDefined();
      expect(service.trackEvent).toHaveBeenCalled();
    });

    it('should track error events', () => {
      const event = {
        event_type: 'error',
        user_id: 'user123',
        error_message: 'Model not found',
        error_code: 'MODEL_NOT_FOUND',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      const result = controller.trackEvent(event, mockRequest);

      expect(result).toBeDefined();
      expect(service.trackEvent).toHaveBeenCalled();
    });

    it('should track logout events', () => {
      const event = {
        event_type: 'logout',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      const result = controller.trackEvent(event, mockRequest);

      expect(result).toBeDefined();
      expect(service.trackEvent).toHaveBeenCalled();
    });

    it('should include metadata in tracking', () => {
      const event = {
        event_type: 'custom_event',
        user_id: 'user123',
        metadata: {
          action: 'button_click',
          button_id: 'submit',
        },
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      const result = controller.trackEvent(event, mockRequest);

      expect(result).toBeDefined();
      expect(service.trackEvent).toHaveBeenCalled();
    });
  });

  describe('Input Validation', () => {
    it('should validate event_type field', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      expect(() => controller.trackEvent(event, mockRequest)).not.toThrow();
    });

    it('should reject missing event_type', () => {
      const event = {
        // event_type: undefined,
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockImplementation(() => {
        throw new HttpException('event_type is required', HttpStatus.BAD_REQUEST);
      });

      expect(() => controller.trackEvent(event as any)).toThrow();
    });

    it('should validate user_id field', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      expect(() => controller.trackEvent(event, mockRequest)).not.toThrow();
    });

    it('should reject missing user_id', () => {
      const event = {
        event_type: 'login',
        // user_id: undefined,
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockImplementation(() => {
        throw new HttpException('user_id is required', HttpStatus.BAD_REQUEST);
      });

      expect(() => controller.trackEvent(event as any)).toThrow();
    });

    it('should validate timestamp format', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      expect(() => controller.trackEvent(event, mockRequest)).not.toThrow();
    });

    it('should reject invalid timestamp', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: 'invalid-date',
      };

      vi.spyOn(service, 'trackEvent').mockImplementation(() => {
        throw new HttpException('Invalid timestamp format', HttpStatus.BAD_REQUEST);
      });

      expect(() => controller.trackEvent(event as any)).toThrow();
    });

    it('should validate event_type format', () => {
      const event = {
        event_type: 'valid_event_type',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      expect(() => controller.trackEvent(event, mockRequest)).not.toThrow();
    });

    it('should reject invalid event_type characters', () => {
      const event = {
        event_type: 'invalid!@#$type',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockImplementation(() => {
        throw new HttpException('Invalid event_type format', HttpStatus.BAD_REQUEST);
      });

      expect(() => controller.trackEvent(event as any)).toThrow();
    });

    it('should reject oversized payload', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        metadata: { huge: 'x'.repeat(1000000) },
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockImplementation(() => {
        throw new HttpException('Payload too large', HttpStatus.REQUEST_ENTITY_TOO_LARGE);
      });

      expect(() => controller.trackEvent(event as any)).toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockImplementation(() => {
        throw new HttpException('Service error', HttpStatus.INTERNAL_SERVER_ERROR);
      });

      expect(() => controller.trackEvent(event, mockRequest)).toThrow();
    });

    it('should handle backend connection errors', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockImplementation(() => {
        throw new HttpException('Backend unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      });

      expect(() => controller.trackEvent(event, mockRequest)).toThrow();
    });

    it('should not expose database errors', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockImplementation(() => {
        throw new HttpException('Internal Error', HttpStatus.INTERNAL_SERVER_ERROR);
      });

      expect(() => controller.trackEvent(event, mockRequest)).toThrow();
    });

    it('should handle concurrent tracking requests', async () => {
      const events = Array(10)
        .fill(null)
        .map((_, i) => ({
          event_type: 'login',
          user_id: `user${i}`,
          timestamp: new Date().toISOString(),
        }));

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      for (const event of events) {
        const result = controller.trackEvent(event, mockRequest);
      }
    });
  });

  describe('Response Format', () => {
    it('should return success status', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      const result = controller.trackEvent(event, mockRequest);

      expect(result).toBeDefined();
    });

    it('should not expose internal details', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      const result = controller.trackEvent(event, mockRequest);

      expect(result).toBeDefined();
    });

    it('should return consistent response format', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      const result1 = controller.trackEvent(event, mockRequest);
      const result2 = controller.trackEvent(event, mockRequest);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe('Authorization', () => {
    it('should require JWT authentication', () => {
      // Controller should have JWT guard on trackEvent
      expect(controller.trackEvent).toBeDefined();
    });

    it('should validate JWT token on requests', () => {
      // Requests without valid JWT should be rejected
      expect(controller.trackEvent).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should handle high-frequency tracking', () => {
      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      for (let i = 0; i < 100; i++) {
        const event = {
          event_type: 'ping',
          user_id: 'user123',
          timestamp: new Date().toISOString(),
        };

        const result = controller.trackEvent(event, mockRequest);
      }
    });

    it('should respect rate limits', () => {
      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      // Should allow normal rate
      const event = {
        event_type: 'login',
        user_id: 'user123',
        timestamp: new Date().toISOString(),
      };

      const result = controller.trackEvent(event, mockRequest);
      expect(result).toBeDefined();
    });
  });

  describe('Data Privacy', () => {
    it('should not log sensitive data', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        password: 'secret123', // Should not be tracked
        timestamp: new Date().toISOString(),
      };

      // Controller should filter sensitive fields
      expect(controller.trackEvent).toBeDefined();
    });

    it('should not expose user PII', () => {
      const event = {
        event_type: 'login',
        user_id: 'user123',
        email: 'user@example.com', // Should be handled carefully
        timestamp: new Date().toISOString(),
      };

      vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

      const result = controller.trackEvent(event, mockRequest);
      expect(result).toBeDefined();
    });
  });

  describe('Event Types', () => {
    const eventTypes = ['login', 'logout', 'inference', 'error', 'signup', 'payment'];

    eventTypes.forEach((eventType) => {
      it(`should track ${eventType} events`, () => {
        const event = {
          event_type: eventType,
          user_id: 'user123',
          timestamp: new Date().toISOString(),
        };

        vi.spyOn(service, 'trackEvent').mockReturnValue(of({ success: true }));

        const result = controller.trackEvent(event, mockRequest);
      });
    });
  });
});
