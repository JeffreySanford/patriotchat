import { test, expect } from '@playwright/test';
import { apiRequest } from '../support/api-client';
import { generateTestUser, TEST_DATA } from '../support/test-data';

test.describe('Critical Requirement: Database (PostgreSQL with Connection Pooling)', () => {
  test.describe('Connection Pooling', () => {
    test('Should handle concurrent requests efficiently', async () => {
      const promises = [];

      // Create concurrent user registrations
      for (let i = 0; i < TEST_DATA.CONCURRENT_REQUEST_COUNT; i++) {
        const testUser = generateTestUser();

        const promise = apiRequest({
          method: 'POST',
          endpoint: '/auth/register',
          service: 'auth',
          body: {
            username: testUser.username,
            email: testUser.email,
            password: testUser.password,
          },
        });

        promises.push(promise);
      }

      // Execute all concurrently
      const results = await Promise.all(promises);

      // Verify all succeeded
      const successCount = results.filter((r) => r.ok).length;
      expect(successCount).toBe(TEST_DATA.CONCURRENT_REQUEST_COUNT);
      console.log(
        `✓ All ${TEST_DATA.CONCURRENT_REQUEST_COUNT} concurrent requests succeeded`,
      );
    });

    test('Connection pool should recover after spike', async () => {
      // First spike: many requests
      const spike1 = [];
      for (let i = 0; i < 5; i++) {
        const testUser = generateTestUser();
        spike1.push(
          apiRequest({
            method: 'POST',
            endpoint: '/auth/register',
            service: 'auth',
            body: {
              username: testUser.username,
              email: testUser.email,
              password: testUser.password,
            },
          }),
        );
      }

      const spike1Results = await Promise.all(spike1);
      expect(spike1Results.every((r) => r.ok)).toBe(true);
      console.log(`✓ First spike succeeded (5 requests)`);

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Second spike: verify recovery
      const spike2 = [];
      for (let i = 0; i < 5; i++) {
        const testUser = generateTestUser();
        spike2.push(
          apiRequest({
            method: 'POST',
            endpoint: '/auth/register',
            service: 'auth',
            body: {
              username: testUser.username,
              email: testUser.email,
              password: testUser.password,
            },
          }),
        );
      }

      const spike2Results = await Promise.all(spike2);
      expect(spike2Results.every((r) => r.ok)).toBe(true);
      console.log(`✓ Pool recovered - second spike succeeded (5 requests)`);
    });
  });

  test.describe('Data Persistence', () => {
    test('Stored data should persist across requests', async () => {
      const testUser = generateTestUser();

      // Register user
      const registerResponse = await apiRequest({
        method: 'POST',
        endpoint: '/auth/register',
        service: 'auth',
        body: {
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(registerResponse.ok).toBe(true);
      const userId = registerResponse.data?.userId;
      const email = registerResponse.data?.email;

      // Verify user data persists
      const profileResponse = await apiRequest({
        method: 'GET',
        endpoint: `/auth/profile/${userId}`,
        service: 'auth',
      });

      expect(profileResponse.ok).toBe(true);
      expect(profileResponse.data?.email).toBe(email);
      console.log(`✓ User data persisted: ${email}`);
    });

    test('Multiple database operations should maintain consistency', async () => {
      const testUser = generateTestUser();

      // Operation 1: Register
      const registerResponse = await apiRequest({
        method: 'POST',
        endpoint: '/auth/register',
        service: 'auth',
        body: {
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(registerResponse.ok).toBe(true);
      const userId = registerResponse.data?.userId;

      // Operation 2: Update profile
      const updateResponse = await apiRequest({
        method: 'PUT',
        endpoint: `/auth/profile/${userId}`,
        service: 'auth',
        body: {
          displayName: 'Test User Display Name',
        },
      });

      expect(updateResponse.ok).toBe(true);

      // Operation 3: Verify update
      const profileResponse = await apiRequest({
        method: 'GET',
        endpoint: `/auth/profile/${userId}`,
        service: 'auth',
      });

      expect(profileResponse.ok).toBe(true);
      expect(profileResponse.data?.displayName).toBe('Test User Display Name');
      console.log(`✓ Multi-operation consistency maintained`);
    });
  });

  test.describe('Query Performance', () => {
    test('Database queries should execute quickly', async () => {
      const testUser = generateTestUser();

      // Create user
      const registerResponse = await apiRequest({
        method: 'POST',
        endpoint: '/auth/register',
        service: 'auth',
        body: {
          username: testUser.username,
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(registerResponse.ok).toBe(true);
      const userId = registerResponse.data?.userId;

      // Measure query performance
      const startTime = performance.now();

      const profileResponse = await apiRequest({
        method: 'GET',
        endpoint: `/auth/profile/${userId}`,
        service: 'auth',
      });

      const queryTime = performance.now() - startTime;

      expect(profileResponse.ok).toBe(true);
      expect(queryTime).toBeLessThan(500); // Should be under 500ms
      console.log(`✓ Query executed in ${queryTime.toFixed(2)}ms`);
    });
  });

  test.describe('Database Health', () => {
    test('PostgreSQL connection should be healthy', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/health',
        service: 'gateway',
      });

      expect(response.ok).toBe(true);
      expect(response.data?.database).toBeDefined();
      console.log(`✓ Database health: OK`);
    });

    test('Connection pool status should be available', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/health/db',
        service: 'gateway',
      });

      expect(response.ok).toBe(true);
      expect(response.data?.poolSize).toBeDefined();
      expect(response.data?.activeConnections).toBeDefined();
      console.log(
        `✓ Pool size: ${response.data?.poolSize}, Active: ${response.data?.activeConnections}`,
      );
    });
  });
});
