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
      expect((response.data?.models as Array<any>).length).toBeGreaterThan(0);

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
      const models =
        (response.data?.models as Array<{
          id: string;
          name: string;
        }>) || [];

      // Verify expected models are available by checking model IDs
      const modelIds = models.map((m) => m.id);
      for (const model of TEST_DATA.AVAILABLE_MODELS) {
        expect(modelIds).toContain(model);
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
      const models = (response.data?.models as Array<any>) || [];
      expect(models).toBeDefined();
      expect(models[0]).toBeDefined();
      console.log(`✓ Model selector API operational`);
    });
  });

  test.describe.serial('Model Selection', () => {
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
      const token = registerResponse.data?.token as string;

      // Query with llama2
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        service: 'gateway',
        token,
        body: {
          prompt: 'What is AI?',
          model: 'llama2',
        },
      });

      expect(queryResponse.ok).toBe(true);
      expect(queryResponse.data?.text).toBeDefined();
      console.log(`✓ Inference successful with llama2 model`);
    });

    test('Should execute inference with liberty-mistral-v1.0 model', async () => {
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
      const token = registerResponse.data?.token as string;

      // Query with liberty-mistral-v1.0
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        service: 'gateway',
        token,
        body: {
          prompt: 'What is constitutional governance?',
          model: 'liberty-mistral-v1.0',
        },
      });

      expect(queryResponse.ok).toBe(true);
      expect(queryResponse.data?.text).toBeDefined();
      console.log(`✓ Inference successful with liberty-mistral-v1.0 model`);
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
      const token = registerResponse.data?.token as string;

      // Query with mistral
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        service: 'gateway',
        token,
        body: {
          prompt: 'Explain machine learning',
          model: 'mistral',
        },
      });

      expect(queryResponse.ok).toBe(true);
      expect(queryResponse.data?.text).toBeDefined();
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
      const token = registerResponse.data?.token as string;

      // Query with neural-chat
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        service: 'gateway',
        token,
        body: {
          prompt: 'What is deep learning?',
          model: 'neural-chat',
        },
      });

      expect(queryResponse.ok).toBe(true);
      expect(queryResponse.data?.text).toBeDefined();
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
      const token = registerResponse.data?.token as string;

      // Query with invalid model
      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        service: 'gateway',
        token,
        body: {
          prompt: 'Test query',
          model: 'nonexistent-model',
        },
      });

      // Should either reject or fall back gracefully
      // Invalid models should return 400 or fall back to default
      expect(queryResponse.status === 400 || queryResponse.ok).toBe(true);
      console.log(
        `✓ Invalid model handled with status ${queryResponse.status}`,
      );
    });

    test('Model metadata should be available', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      expect(response.data?.models).toBeDefined();
      expect(Array.isArray(response.data?.models)).toBe(true);

      const models = response.data?.models as Array<any>;
      expect(models).toBeDefined();
      for (const model of models || []) {
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
      const token = registerResponse.data?.token as string;

      // Query with model 1
      const query1 = await apiRequest({
        method: 'POST',
        endpoint: '/inference/query',
        service: 'llm',
        token,
        body: {
          text: 'First query',
          model: 'liberty-mistral-v1.0',
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
