import { test, expect } from '@playwright/test';
import { apiRequest } from '../support/api-client';
import { generateTestUser, TEST_DATA } from '../support/test-data';

test.describe('Critical Requirement: LLM Model Selector', () => {
  test.describe('Model Availability', () => {
    test('Should list available LLM models', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      expect(Array.isArray(response.data?.models)).toBe(true);
      expect(response.data?.models.length).toBeGreaterThan(0);

      const models = response.data?.models as string[];
      console.log(`✓ Available models: ${models.join(', ')}`);
    });

    test('Should include required models', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      const models = response.data?.models as string[];

      // Verify expected models are available
      for (const model of TEST_DATA.AVAILABLE_MODELS) {
        expect(models).toContain(model);
      }

      console.log(
        `✓ All required models present: ${TEST_DATA.AVAILABLE_MODELS.join(', ')}`,
      );
    });

    test('Model selector should be accessible via API', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      expect(response.data?.models).toBeDefined();
      expect(response.data?.models[0]).toBeDefined();
      console.log(`✓ Model selector API operational`);
    });
  });

  test.describe('Model Selection', () => {
    test('Should execute inference with llama2 model', async () => {
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

      // Query with llama2
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'What is AI?',
          model: 'llama2',
        },
      });

      expect(queryResponse.ok).toBe(true);
      expect(queryResponse.data?.response).toBeDefined();
      console.log(`✓ Inference successful with llama2 model`);
    });

    test('Should execute inference with mistral model', async () => {
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

      // Query with mistral
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'Explain machine learning',
          model: 'mistral',
        },
      });

      expect(queryResponse.ok).toBe(true);
      expect(queryResponse.data?.response).toBeDefined();
      console.log(`✓ Inference successful with mistral model`);
    });

    test('Should execute inference with neural-chat model', async () => {
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

      // Query with neural-chat
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'What is deep learning?',
          model: 'neural-chat',
        },
      });

      expect(queryResponse.ok).toBe(true);
      expect(queryResponse.data?.response).toBeDefined();
      console.log(`✓ Inference successful with neural-chat model`);
    });
  });

  test.describe('Model Configuration', () => {
    test('Should handle invalid model gracefully', async () => {
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

      // Query with invalid model
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'Test query',
          model: 'nonexistent-model',
        },
      });

      expect(queryResponse.ok).toBe(false);
      expect(queryResponse.status).toBe(400);
      console.log(
        `✓ Invalid model rejected with status ${queryResponse.status}`,
      );
    });

    test('Model metadata should be available', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models/metadata',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      expect(response.data?.models).toBeDefined();
      expect(Array.isArray(response.data?.models)).toBe(true);

      const models = response.data?.models;
      for (const model of models) {
        expect(model.name).toBeDefined();
        expect(model.description).toBeDefined();
      }

      console.log(`✓ Model metadata available for ${models.length} models`);
    });
  });

  test.describe('Frontend Integration', () => {
    test('Model selector should be available on frontend', async () => {
      // Note: This would require using Playwright's page navigation
      // In a full E2E test, you would verify the frontend UI
      // For now, we verify the backend API exists

      const response = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      console.log(
        `✓ Model selector backend API available for frontend integration`,
      );
    });

    test('Should support model switching during session', async () => {
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

      // Query with model 1
      const query1 = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'First query',
          model: 'llama2',
        },
      });

      expect(query1.ok).toBe(true);

      // Query with model 2 (switch)
      const query2 = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'Second query',
          model: 'mistral',
        },
      });

      expect(query2.ok).toBe(true);
      console.log(`✓ Successfully switched models during session`);
    });
  });
});
