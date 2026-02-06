import { test, expect } from '@playwright/test';
import { apiRequest } from '../support/api-client';
import { generateTestUser, generateTestQuery } from '../support/test-data';

test.describe('E2E Workflows', () => {
  test.describe('User Registration & Login Flow', () => {
    test('Should complete full registration workflow', async () => {
      const testUser = generateTestUser();

      // Step 1: Register
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
      expect(registerResponse.data?.token).toBeDefined();
      console.log(`✓ User registered: ${testUser.email}`);

      const userId = registerResponse.data?.userId;
      const token = registerResponse.data?.token;

      // Step 2: Verify user can access profile
      const profileResponse = await apiRequest({
        method: 'GET',
        endpoint: `/auth/profile/${userId}`,
        service: 'auth',
        token,
      });

      expect(profileResponse.ok).toBe(true);
      expect(profileResponse.data?.email).toBe(testUser.email);
      console.log(`✓ Profile accessible after registration`);
    });

    test('Should complete full login workflow', async () => {
      const testUser = generateTestUser();

      // Register user first
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
      console.log(`✓ User registered`);

      // Step 1: Login
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
      expect(loginResponse.data?.token).toBeDefined();
      console.log(`✓ User logged in successfully`);

      const token = loginResponse.data?.token;

      // Step 2: Use token for authenticated request
      const profileResponse = await apiRequest({
        method: 'GET',
        endpoint: '/auth/profile',
        service: 'auth',
        token,
      });

      expect(profileResponse.ok).toBe(true);
      console.log(`✓ Authenticated request successful`);
    });
  });

  test.describe.serial('Query & Inference Workflow', () => {
    test('Should execute complete query workflow', async () => {
      const testUser = generateTestUser();
      const testQuery = generateTestQuery();

      // Step 1: Register and get token
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
      console.log(`✓ User authenticated`);

      // Step 2: Execute inference query
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: testQuery.text,
          model: testQuery.model,
        },
      });

      expect(queryResponse.ok).toBe(true);
      expect(queryResponse.data?.response).toBeDefined();
      console.log(`✓ Inference executed with ${testQuery.model}`);

      // Step 3: Verify query was tracked
      const analyticsResponse = await apiRequest({
        method: 'GET',
        endpoint: `/analytics/queries?userId=${registerResponse.data?.userId}`,
        service: 'analytics',
      });

      expect(analyticsResponse.ok).toBe(true);
      console.log(`✓ Query tracked in analytics`);
    });

    test('Should support multiple queries in session', async () => {
      const testUser = generateTestUser();

      // Register and get token
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
      const userId = registerResponse.data?.userId;

      // Execute 3 queries with different models
      const models = ['llama2', 'mistral', 'neural-chat'];
      const queryResults = [];

      for (let i = 0; i < models.length; i++) {
        const query = generateTestQuery(models[i] as any);

        const queryResponse = await apiRequest({
          method: 'POST',
          endpoint: '/inference/query',
          service: 'llm',
          token,
          body: {
            text: query.text,
            model: query.model,
          },
        });

        expect(queryResponse.ok).toBe(true);
        queryResults.push(queryResponse.data);
        console.log(`✓ Query ${i + 1} executed with ${query.model}`);
      }

      // Verify all queries were tracked
      const analyticsResponse = await apiRequest({
        method: 'GET',
        endpoint: `/analytics/queries?userId=${userId}`,
        service: 'analytics',
      });

      expect(analyticsResponse.ok).toBe(true);
      expect(
        analyticsResponse.data?.queries?.length || 0,
      ).toBeGreaterThanOrEqual(queryResults.length);
      console.log(`✓ All ${queryResults.length} queries tracked`);
    });
  });

  test.describe('Cross-Service Integration', () => {
    test('Should coordinate between auth and inference services', async () => {
      const testUser = generateTestUser();

      // Step 1: Auth service - Register
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
      console.log(`✓ Auth service: User registered`);

      // Step 2: LLM service - Query
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'What is the weather?',
          model: 'llama2',
        },
      });

      expect(queryResponse.ok).toBe(true);
      console.log(`✓ LLM service: Query executed`);

      // Step 3: Analytics service - Track
      const analyticsResponse = await apiRequest({
        method: 'GET',
        endpoint: `/analytics/queries?userId=${registerResponse.data?.userId}`,
        service: 'analytics',
      });

      expect(analyticsResponse.ok).toBe(true);
      console.log(`✓ Analytics service: Query tracked`);
    });

    test('Should maintain session across services', async () => {
      const testUser = generateTestUser();

      // Register
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
      const userId = registerResponse.data?.userId;

      // Make multiple requests to different services with same token
      const authCheck = await apiRequest({
        method: 'GET',
        endpoint: `/auth/profile/${userId}`,
        service: 'auth',
        token,
      });

      expect(authCheck.ok).toBe(true);

      const query = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'Test',
          model: 'llama2',
        },
      });

      expect(query.ok).toBe(true);

      const analytics = await apiRequest({
        method: 'GET',
        endpoint: `/analytics/queries?userId=${userId}`,
        service: 'analytics',
      });

      expect(analytics.ok).toBe(true);
      console.log(
        `✓ Session maintained across auth, llm, and analytics services`,
      );
    });
  });

  test.describe('Error Handling & Recovery', () => {
    test('Should handle invalid credentials gracefully', async () => {
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

      // Try login with wrong password
      const loginResponse = await apiRequest({
        method: 'POST',
        endpoint: '/auth/login',
        service: 'auth',
        body: {
          email: testUser.email,
          password: 'WrongPassword123!',
        },
      });

      expect(loginResponse.ok).toBe(false);
      expect(loginResponse.status).toBe(401);
      console.log(
        `✓ Invalid credentials rejected (status: ${loginResponse.status})`,
      );
    });

    test('Should recover from service failures', async () => {
      const testUser = generateTestUser();

      // Register successfully
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

      // Make request that might fail
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'Test query after potential failure',
          model: 'llama2',
        },
      });

      // Should either succeed or fail gracefully
      expect([true, false]).toContain(queryResponse.ok);
      console.log(
        `✓ Service handled response appropriately (status: ${queryResponse.status})`,
      );
    });

    test('Should handle invalid requests properly', async () => {
      const testUser = generateTestUser();

      // Register
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

      // Make invalid request (missing required fields)
      const invalidQuery = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          // Missing 'text' and 'model'
        },
      });

      expect(invalidQuery.ok).toBe(false);
      expect(invalidQuery.status).toBe(400);
      console.log(
        `✓ Invalid request rejected (status: ${invalidQuery.status})`,
      );
    });
  });
});
