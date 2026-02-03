import { test, expect } from '@playwright/test';
import { apiRequest, measureLatency } from '../support/api-client';
import { TEST_DATA } from '../support/test-data';

test.describe('Critical Requirement: Performance (Auth < 100ms)', () => {
  test.describe('Service Latency', () => {
    test('Auth service should respond in under 100ms', async () => {
      const { response, latency } = await measureLatency({
        method: 'GET',
        endpoint: '/auth/health',
        service: 'auth',
      });

      expect(response.ok).toBe(true);
      expect(latency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);
      console.log(`✓ Auth latency: ${latency.toFixed(2)}ms`);
    });

    test('API Gateway should respond in under 100ms', async () => {
      const { response, latency } = await measureLatency({
        method: 'GET',
        endpoint: '/health',
        service: 'gateway',
      });

      expect(response.ok).toBe(true);
      expect(latency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);
      console.log(`✓ Gateway latency: ${latency.toFixed(2)}ms`);
    });

    test('Funding service should respond in under 100ms', async () => {
      const { response, latency } = await measureLatency({
        method: 'GET',
        endpoint: '/funding/health',
        service: 'funding',
      });

      expect(response.ok).toBe(true);
      expect(latency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);
      console.log(`✓ Funding latency: ${latency.toFixed(2)}ms`);
    });

    test('Policy service should respond in under 100ms', async () => {
      const { response, latency } = await measureLatency({
        method: 'GET',
        endpoint: '/policy/health',
        service: 'policy',
      });

      expect(response.ok).toBe(true);
      expect(latency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);
      console.log(`✓ Policy latency: ${latency.toFixed(2)}ms`);
    });

    test('LLM service should respond in under 100ms', async () => {
      const { response, latency } = await measureLatency({
        method: 'GET',
        endpoint: '/inference/health',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      expect(latency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);
      console.log(`✓ LLM latency: ${latency.toFixed(2)}ms`);
    });

    test('Analytics service should respond in under 100ms', async () => {
      const { response, latency } = await measureLatency({
        method: 'GET',
        endpoint: '/analytics/health',
        service: 'analytics',
      });

      expect(response.ok).toBe(true);
      expect(latency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);
      console.log(`✓ Analytics latency: ${latency.toFixed(2)}ms`);
    });
  });

  test.describe('Performance Baseline', () => {
    test('Should maintain consistent response times under load', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 5; i++) {
        const { latency } = await measureLatency({
          method: 'GET',
          endpoint: '/auth/health',
          service: 'auth',
        });
        measurements.push(latency);
      }

      const avgLatency =
        measurements.reduce((a, b) => a + b) / measurements.length;
      const maxLatency = Math.max(...measurements);

      expect(avgLatency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);
      expect(maxLatency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS * 1.5);
      console.log(
        `✓ Avg latency: ${avgLatency.toFixed(2)}ms, Max: ${maxLatency.toFixed(2)}ms`,
      );
    });

    test('All services should be operational', async () => {
      const services = [
        { endpoint: '/auth/health', service: 'auth' },
        { endpoint: '/health', service: 'gateway' },
        { endpoint: '/funding/health', service: 'funding' },
        { endpoint: '/policy/health', service: 'policy' },
        { endpoint: '/inference/health', service: 'llm' },
        { endpoint: '/analytics/health', service: 'analytics' },
      ];

      for (const { endpoint, service } of services) {
        const response = await apiRequest({
          method: 'GET',
          endpoint,
          service: service as any,
        });

        expect(response.ok).toBe(true);
      }

      console.log(`✓ All ${services.length} services operational`);
    });
  });
});
