import { test, expect } from '@playwright/test';
import { apiRequest, measureLatency } from '../support/api-client';
import { TEST_DATA } from '../support/test-data';

test.describe('Performance Tests', () => {
  test.describe('Service Latency Benchmarks', () => {
    test('Should measure auth service latency', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 10; i++) {
        const { latency } = await measureLatency({
          method: 'GET',
          endpoint: '/auth/health',
          service: 'auth',
        });
        measurements.push(latency);
      }

      const avg = measurements.reduce((a, b) => a + b) / measurements.length;
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);

      expect(avg).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);

      console.log(`Auth Service Latency:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
    });

    test('Should measure gateway latency', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 10; i++) {
        const { latency } = await measureLatency({
          method: 'GET',
          endpoint: '/health',
          service: 'gateway',
        });
        measurements.push(latency);
      }

      const avg = measurements.reduce((a, b) => a + b) / measurements.length;
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);

      expect(avg).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);

      console.log(`Gateway Latency:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
    });

    test('Should measure funding service latency', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 10; i++) {
        const { latency } = await measureLatency({
          method: 'GET',
          endpoint: '/funding/health',
          service: 'funding',
        });
        measurements.push(latency);
      }

      const avg = measurements.reduce((a, b) => a + b) / measurements.length;
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);

      expect(avg).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);

      console.log(`Funding Service Latency:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
    });

    test('Should measure policy service latency', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 10; i++) {
        const { latency } = await measureLatency({
          method: 'GET',
          endpoint: '/policy/health',
          service: 'policy',
        });
        measurements.push(latency);
      }

      const avg = measurements.reduce((a, b) => a + b) / measurements.length;
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);

      expect(avg).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);

      console.log(`Policy Service Latency:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
    });

    test('Should measure LLM service latency', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 10; i++) {
        const { latency } = await measureLatency({
          method: 'GET',
          endpoint: '/inference/health',
          service: 'llm',
        });
        measurements.push(latency);
      }

      const avg = measurements.reduce((a, b) => a + b) / measurements.length;
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);

      expect(avg).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);

      console.log(`LLM Service Latency:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
    });

    test('Should measure analytics service latency', async () => {
      const measurements: number[] = [];

      for (let i = 0; i < 10; i++) {
        const { latency } = await measureLatency({
          method: 'GET',
          endpoint: '/analytics/health',
          service: 'analytics',
        });
        measurements.push(latency);
      }

      const avg = measurements.reduce((a, b) => a + b) / measurements.length;
      const min = Math.min(...measurements);
      const max = Math.max(...measurements);

      expect(avg).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);

      console.log(`Analytics Service Latency:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
      console.log(`  Min: ${min.toFixed(2)}ms`);
      console.log(`  Max: ${max.toFixed(2)}ms`);
    });
  });

  test.describe('Throughput Benchmarks', () => {
    test('Should handle concurrent requests efficiently', async () => {
      const concurrentCount = 10;
      const startTime = performance.now();

      const promises = [];
      for (let i = 0; i < concurrentCount; i++) {
        promises.push(
          measureLatency({
            method: 'GET',
            endpoint: '/auth/health',
            service: 'auth',
          }),
        );
      }

      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;

      const latencies = results.map((r) => r.latency);
      const avgLatency = latencies.reduce((a, b) => a + b) / latencies.length;

      expect(avgLatency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);

      console.log(
        `Concurrent Request Performance (${concurrentCount} requests):`,
      );
      console.log(`  Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`  Average latency: ${avgLatency.toFixed(2)}ms`);
      console.log(`  Max latency: ${Math.max(...latencies).toFixed(2)}ms`);
      console.log(
        `  Throughput: ${(1000 / (totalTime / concurrentCount)).toFixed(2)} req/s`,
      );
    });
  });

  test.describe('Database Query Performance', () => {
    test('Should execute queries within acceptable time', async () => {
      const measurements: number[] = [];

      // Measure database-dependent queries
      for (let i = 0; i < 5; i++) {
        const startTime = performance.now();

        await apiRequest({
          method: 'GET',
          endpoint: '/health',
          service: 'gateway',
        });

        const latency = performance.now() - startTime;
        measurements.push(latency);
      }

      const avg = measurements.reduce((a, b) => a + b) / measurements.length;

      expect(avg).toBeLessThan(500); // 500ms for DB queries

      console.log(`Database Query Performance:`);
      console.log(`  Average: ${avg.toFixed(2)}ms`);
    });
  });

  test.describe('API Response Times', () => {
    test('Health check responses should be fast', async () => {
      const services = [
        { endpoint: '/auth/health', name: 'Auth' },
        { endpoint: '/health', name: 'Gateway' },
        { endpoint: '/funding/health', name: 'Funding' },
        { endpoint: '/policy/health', name: 'Policy' },
        { endpoint: '/inference/health', name: 'LLM' },
        { endpoint: '/analytics/health', name: 'Analytics' },
      ];

      const results: Record<string, number> = {};

      for (const { endpoint, name } of services) {
        const { latency } = await measureLatency({
          method: 'GET',
          endpoint,
          service: name.toLowerCase() as any,
        });

        results[name] = latency;
        expect(latency).toBeLessThan(TEST_DATA.PERFORMANCE_THRESHOLD_MS);
      }

      console.log('Health Check Response Times:');
      for (const [name, latency] of Object.entries(results)) {
        console.log(`  ${name}: ${latency.toFixed(2)}ms`);
      }
    });
  });
});
