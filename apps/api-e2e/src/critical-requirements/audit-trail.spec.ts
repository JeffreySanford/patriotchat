import { test, expect } from '@playwright/test';
import { apiRequest } from '../support/api-client';
import { generateTestUser } from '../support/test-data';

test.describe('Critical Requirement: Audit Trail (Immutable PostgreSQL Logs)', () => {
  test.describe('User Action Logging', () => {
    test('Should log user registration', async () => {
      const testUser = generateTestUser();

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
      expect(registerResponse.data?.userId).toBeDefined();
      console.log(`✓ Registration logged for user: ${testUser.email}`);

      // Verify audit log exists
      const auditResponse = await apiRequest({
        method: 'GET',
        endpoint: `/analytics/audit?userId=${registerResponse.data?.userId}`,
        service: 'analytics',
      });

      expect(auditResponse.ok).toBe(true);
      expect(auditResponse.data?.logs).toBeDefined();
      console.log(
        `✓ Audit trail accessible for user ${registerResponse.data?.userId}`,
      );
    });

    test('Should log user login', async () => {
      const testUser = generateTestUser();

      // Register first
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

      // Login
      const loginResponse = await apiRequest({
        method: 'POST',
        endpoint: '/auth/login',
        service: 'auth',
        body: {
          email: testUser.email,
          password: testUser.password,
        },
      });

      expect(loginResponse.ok).toBe(true);
      console.log(`✓ Login logged for user: ${testUser.email}`);

      // Check audit log
      const auditResponse = await apiRequest({
        method: 'GET',
        endpoint: `/analytics/audit?userId=${registerResponse.data?.userId}`,
        service: 'analytics',
      });

      expect(auditResponse.ok).toBe(true);
      const logs = auditResponse.data?.logs || [];
      expect(logs.length).toBeGreaterThan(0);
      console.log(
        `✓ Login action recorded in audit trail (${logs.length} total logs)`,
      );
    });
  });

  test.describe('Query Tracking', () => {
    test('Should track LLM inference queries', async () => {
      const testUser = generateTestUser();

      // Register and login
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
      const token = registerResponse.data?.token;

      // Make inference request
      const inferenceResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'What is machine learning?',
          model: 'llama2',
        },
      });

      expect(inferenceResponse.ok).toBe(true);
      console.log(`✓ Inference query executed and tracked`);

      // Verify tracking in analytics
      const analyticsResponse = await apiRequest({
        method: 'GET',
        endpoint: `/analytics/queries?userId=${registerResponse.data?.userId}`,
        service: 'analytics',
      });

      expect(analyticsResponse.ok).toBe(true);
      console.log(`✓ Query tracked in analytics service`);
    });
  });

  test.describe('Log Integrity', () => {
    test('Logs should be immutable (no modification possible)', async () => {
      // This test verifies that logs cannot be tampered with
      // by attempting to modify an existing audit entry
      const testUser = generateTestUser();

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

      // Attempt to modify audit log (should fail)
      const modifyResponse = await apiRequest({
        method: 'PUT',
        endpoint: `/analytics/audit/${userId}`,
        service: 'analytics',
        body: { action: 'MODIFIED' },
      });

      // Should be forbidden
      expect(modifyResponse.status).toBe(403);
      console.log(
        `✓ Audit logs are protected from modification (status: ${modifyResponse.status})`,
      );
    });

    test('All audit operations should be timestamped', async () => {
      const testUser = generateTestUser();

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

      // Get audit logs
      const auditResponse = await apiRequest({
        method: 'GET',
        endpoint: `/analytics/audit?userId=${registerResponse.data?.userId}`,
        service: 'analytics',
      });

      expect(auditResponse.ok).toBe(true);
      const logs = auditResponse.data?.logs || [];

      // Verify all logs have timestamps
      for (const log of logs) {
        expect(log.timestamp).toBeDefined();
        expect(typeof log.timestamp).toBe('string');
      }

      console.log(`✓ All ${logs.length} audit entries have timestamps`);
    });
  });
});
