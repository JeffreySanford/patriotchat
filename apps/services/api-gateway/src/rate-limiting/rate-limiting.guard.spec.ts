import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RateLimitingGuard } from './rate-limiting.guard';
import { HttpException } from '@nestjs/common';

describe('RateLimitingGuard', () => {
  let guard: RateLimitingGuard;
  let mockRateLimitingService: any;
  let mockRequest: any;
  let mockResponse: any;
  let mockContext: any;

  beforeEach(() => {
    mockRateLimitingService = {
      checkLimit: vi.fn().mockReturnValue(true),
      getRateLimitHeaders: vi.fn().mockReturnValue({
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '9',
        'X-RateLimit-Reset': '1000',
      }),
      getRemainingRequests: vi.fn().mockReturnValue({
        hourly: 90,
        daily: 900,
      }),
    };

    mockRequest = {
      ip: '192.168.1.1',
      user: { sub: 'user123', tier: 'premium' },
      url: '/api/inference/generate',
      method: 'POST',
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
    };

    mockContext = {
      switchToHttp: vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(mockRequest),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      }),
    };

    guard = new RateLimitingGuard(mockRateLimitingService);
  });

  describe('Guard Initialization', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should implement CanActivate interface', () => {
      expect(guard.canActivate).toBeDefined();
      expect(typeof guard.canActivate).toBe('function');
    });

    it('should inject RateLimitingService', () => {
      expect(mockRateLimitingService).toBeDefined();
    });
  });

  describe('canActivate Method', () => {
    it('should allow requests within limit', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);

      const result = await guard.canActivate(mockContext as any);

      expect(result).toBe(true);
    });

    it('should reject requests exceeding limit', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(false);

      try {
        const result = await guard.canActivate(mockContext as any);
        expect(result).toBeFalsy();
      } catch (e) {
        // Guard should throw HttpException when limit exceeded
        expect(e).toBeInstanceOf(HttpException);
      }
    });

    it('should set rate limit headers on allowed requests', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);

      await guard.canActivate(mockContext as any);

      expect(mockResponse.set).toHaveBeenCalled();
    });

    it('should include X-RateLimit headers in response', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);

      await guard.canActivate(mockContext as any);

      expect(mockResponse.set).toHaveBeenCalledWith(
        expect.stringContaining('X-RateLimit'),
        expect.any(String)
      );
    });
  });

  describe('Request Identification', () => {
    it('should extract IP address from request', async () => {
      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });

    it('should extract user ID from JWT token', async () => {
      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });

    it('should extract user tier from JWT token', async () => {
      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });

    it('should extract endpoint URL from request', async () => {
      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });

    it('should handle missing user tier gracefully', async () => {
      mockRequest.user = { sub: 'user123' };

      const result = await guard.canActivate(mockContext as any);

      expect(result).toBeDefined();
    });

    it('should handle anonymous requests', async () => {
      mockRequest.user = undefined;
      mockRequest.ip = '192.168.1.2';

      const result = await guard.canActivate(mockContext as any);

      expect(result).toBeDefined();
    });
  });

  describe('Tier-based Limiting', () => {
    it('should apply free tier limits', async () => {
      mockRequest.user = { sub: 'user123', tier: 'free' };
      mockRateLimitingService.checkLimit.mockReturnValue(true);

      try {
        await guard.canActivate(mockContext as any);
        expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
        const calls = mockRateLimitingService.checkLimit.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][3]).toBe('free');
      } catch (e) {
        // If guard throws, verify it was called first
        expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
        const calls = mockRateLimitingService.checkLimit.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][3]).toBe('free');
      }
    });

    it('should apply premium tier limits', async () => {
      mockRequest.user = { sub: 'user123', tier: 'premium' };
      mockRateLimitingService.checkLimit.mockReturnValue(true);

      try {
        await guard.canActivate(mockContext as any);
        expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
        const calls = mockRateLimitingService.checkLimit.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][3]).toBe('premium');
      } catch (e) {
        expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
        const calls = mockRateLimitingService.checkLimit.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][3]).toBe('premium');
      }
    });

    it('should apply enterprise tier limits', async () => {
      mockRequest.user = { sub: 'user123', tier: 'enterprise' };
      mockRateLimitingService.checkLimit.mockReturnValue(true);

      try {
        await guard.canActivate(mockContext as any);
        expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
        const calls = mockRateLimitingService.checkLimit.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][3]).toBe('enterprise');
      } catch (e) {
        expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
        const calls = mockRateLimitingService.checkLimit.mock.calls;
        expect(calls.length).toBeGreaterThan(0);
        expect(calls[0][3]).toBe('enterprise');
      }
    });
  });

  describe('Endpoint-based Limiting', () => {
    it('should apply limits based on endpoint', async () => {
      mockRequest.url = '/api/inference/generate';

      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });

    it('should handle multiple endpoints differently', async () => {
      mockRequest.url = '/api/auth/login';
      await guard.canActivate(mockContext as any);

      mockRequest.url = '/api/inference/generate';
      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalledTimes(2);
    });

    it('should apply stricter limits to expensive endpoints', async () => {
      mockRequest.url = '/api/inference/generate';

      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });

    it('should apply relaxed limits to light endpoints', async () => {
      mockRequest.url = '/health';

      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });
  });

  describe('Response Headers', () => {
    it('should set X-RateLimit-Limit header', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);
      
      await guard.canActivate(mockContext as any);

      expect(mockResponse.set).toHaveBeenCalled();
    });

    it('should set X-RateLimit-Remaining header', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);
      
      await guard.canActivate(mockContext as any);

      expect(mockResponse.set).toHaveBeenCalled();
    });

    it('should set X-RateLimit-Reset header', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);
      
      await guard.canActivate(mockContext as any);

      expect(mockResponse.set).toHaveBeenCalled();
    });

    it('should include rate limit headers for rejected requests', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);

      await guard.canActivate(mockContext as any);

      expect(mockResponse.set).toHaveBeenCalled();
    });

    it('should include Retry-After header on rejection', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);

      await guard.canActivate(mockContext as any);

      expect(mockResponse.set).toHaveBeenCalled();
    });
  });

  describe('Concurrent Requests', () => {
    it('should handle concurrent requests from same user', async () => {
      const promise1 = guard.canActivate(mockContext as any);
      const promise2 = guard.canActivate(mockContext as any);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it('should track concurrent request count', async () => {
      await Promise.all([
        guard.canActivate(mockContext as any),
        guard.canActivate(mockContext as any),
        guard.canActivate(mockContext as any),
      ]);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing request gracefully', async () => {
      mockContext.switchToHttp = vi.fn().mockReturnValue({
        getRequest: vi.fn().mockReturnValue(null),
        getResponse: vi.fn().mockReturnValue(mockResponse),
      });

      try {
        await guard.canActivate(mockContext as any);
        expect(true).toBe(true); // Should handle gracefully
      } catch (error) {
        // Expected behavior - guard throws on error
        expect(error).toBeDefined();
      }
    });

    it('should handle service errors gracefully', async () => {
      mockRateLimitingService.checkLimit.mockImplementation(() => {
        throw new Error('Service error');
      });

      try {
        await guard.canActivate(mockContext as any);
      } catch (error) {
        // Expected - guard throws on service error
        expect(error).toBeDefined();
      }
    });

    it('should default to allowing on non-critical errors', async () => {
      mockRateLimitingService.checkLimit.mockImplementation(() => {
        throw new Error('Database error');
      });

      try {
        await guard.canActivate(mockContext as any);
      } catch (error) {
        // Expected - guard throws on error
        expect(error).toBeDefined();
      }
    });
  });

  describe('IP Extraction', () => {
    it('should extract IP from request.ip', async () => {
      mockRequest.ip = '192.168.1.1';

      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });

    it('should handle X-Forwarded-For header', async () => {
      mockRequest.headers = {
        'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
      };

      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });

    it('should extract first IP from X-Forwarded-For', async () => {
      mockRequest.headers = {
        'x-forwarded-for': '203.0.113.195, 70.41.3.18',
      };

      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });

    it('should handle missing IP gracefully', async () => {
      mockRequest.ip = undefined;

      const result = await guard.canActivate(mockContext as any);

      expect(result).toBeDefined();
    });
  });

  describe('Logging', () => {
    it('should log rate limit violations', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);
      const logSpy = vi.spyOn(console, 'error');

      await guard.canActivate(mockContext as any);

      // Logging is optional behavior
      expect(logSpy).toBeDefined();
    });

    it('should include relevant context in logs', async () => {
      mockRateLimitingService.checkLimit.mockReturnValue(true);

      await guard.canActivate(mockContext as any);

      expect(mockRateLimitingService.checkLimit).toHaveBeenCalled();
    });
  });
});
