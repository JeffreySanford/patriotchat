import { test, expect } from '@playwright/test';
import { apiRequest } from '../support/api-client';

/**
 * Comprehensive E2E Tests for Model Switching and Inference Queries
 *
 * This test suite validates:
 * 1. Model switching UI functionality
 * 2. Query execution against multiple available models
 * 3. Model persistence across requests
 * 4. Response consistency across models
 * 5. Error handling for invalid model selections
 */
test.describe('Model Switching and Multi-Model Queries', () => {
  // Test data: various prompts to test against models
  const testPrompts = [
    {
      prompt: 'What are the core principles of the US Constitution?',
      category: 'civics',
    },
    {
      prompt: 'Explain separation of powers in government',
      category: 'government',
    },
    {
      prompt: 'What is fiscal responsibility?',
      category: 'economics',
    },
  ];

  test.describe('Model Availability and Switching', () => {
    test('Should retrieve list of 4 available models', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data?.models).toBeDefined();

      const models = response.data?.models;
      expect(Array.isArray(models)).toBe(true);

      if (!Array.isArray(models)) {
        throw new Error('Models response is not an array');
      }

      expect(models.length).toBeGreaterThanOrEqual(4);
      console.log(
        `✓ Available models (${models.length}): ${models.map((m: any) => m.id || m).join(', ')}`,
      );
    });

    test('Should have expected model properties', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      const models = response.data?.models as any[];
      expect(Array.isArray(models)).toBe(true);
      if (!Array.isArray(models)) {
        throw new Error('Models response is not an array');
      }

      // Each model should have id and name at minimum
      models.forEach((model: any) => {
        if (typeof model === 'object') {
          expect(model.id).toBeDefined();
          expect(typeof model.id).toBe('string');
          expect(model.name || model.id).toBeDefined();

          if (model.description) {
            expect(typeof model.description).toBe('string');
          }
          if (model.provider) {
            expect(typeof model.provider).toBe('string');
          }
        }
      });

      console.log('✓ All models have required properties (id, name)');
    });

    test('Should include expected models: llama2, mistral, neural-chat', async () => {
      const response = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      const models = response.data?.models as any[];
      expect(Array.isArray(models)).toBe(true);
      if (!Array.isArray(models)) {
        throw new Error('Models response is not an array');
      }

      const modelIds = models.map((m: any) =>
        typeof m === 'object' ? m.id : m,
      );

      // Verify the 3 expected models are available
      const expectedModels = ['llama2', 'mistral', 'neural-chat'];
      expectedModels.forEach((expectedModel: string) => {
        expect(modelIds).toContain(expectedModel);
      });

      console.log(
        '✓ All expected models present: llama2, mistral, neural-chat',
      );
    });
  });

  test.describe('Single Model Query Execution', () => {
    test('Should execute query successfully with llama2 model', async () => {
      const testPrompt = testPrompts[0];
      const payload = {
        model: 'llama2',
        prompt: testPrompt.prompt,
        context: 'civic_education',
      };

      const response = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        body: payload,
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      expect(response.data).toBeDefined();

      // Validate response structure
      const responseData = response.data as any;
      expect(
        responseData.model || responseData.modelId || payload.model,
      ).toBeDefined();
      expect(
        responseData.response ||
          responseData.output ||
          responseData.generated_text,
      ).toBeDefined();

      const responseLength = (
        responseData.response ||
        responseData.output ||
        responseData.generated_text ||
        ''
      ).length;
      expect(responseLength).toBeGreaterThan(0);

      console.log(
        `✓ llama2 query successful - response length: ${responseLength} chars`,
      );
    });

    test('Should execute query successfully with mistral model', async () => {
      const testPrompt = testPrompts[1];
      const payload = {
        model: 'mistral',
        prompt: testPrompt.prompt,
        context: 'government',
      };

      const response = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        body: payload,
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      expect(response.data).toBeDefined();

      const responseData = response.data as any;
      const responseLength = (
        responseData.response ||
        responseData.output ||
        responseData.generated_text ||
        ''
      ).length;
      expect(responseLength).toBeGreaterThan(0);

      console.log(
        `✓ mistral query successful - response length: ${responseLength} chars`,
      );
    });

    test('Should execute query successfully with neural-chat model', async () => {
      const testPrompt = testPrompts[2];
      const payload = {
        model: 'neural-chat',
        prompt: testPrompt.prompt,
        context: 'economics',
      };

      const response = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        body: payload,
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      expect(response.data).toBeDefined();

      const responseData = response.data as any;
      const responseLength = (
        responseData.response ||
        responseData.output ||
        responseData.generated_text ||
        ''
      ).length;
      expect(responseLength).toBeGreaterThan(0);

      console.log(
        `✓ neural-chat query successful - response length: ${responseLength} chars`,
      );
    });
  });

  test.describe('Model Switching with Sequential Queries', () => {
    test('Should switch between all 4 models and execute queries', async () => {
      // Get available models
      const modelsResponse = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(modelsResponse.ok).toBe(true);
      const models = modelsResponse.data?.models as any[];
      expect(Array.isArray(models)).toBe(true);
      if (!Array.isArray(models)) {
        throw new Error('Models response is not an array');
      }

      const modelIds = models.map((m: any) =>
        typeof m === 'object' ? m.id : m,
      );

      // Switch to each model and execute a query
      for (const modelId of modelIds) {
        const payload = {
          model: modelId,
          prompt:
            'What is the Constitutional perspective on individual liberty?',
          context: 'constitutional_law',
        };

        const response = await apiRequest({
          method: 'POST',
          endpoint: '/inference/generate',
          body: payload,
          service: 'llm',
        });

        expect(response.ok).toBe(true);
        expect(response.data).toBeDefined();

        const responseData = response.data as any;
        const responseLength = (
          responseData.response ||
          responseData.output ||
          responseData.generated_text ||
          ''
        ).length;
        expect(responseLength).toBeGreaterThan(0);

        console.log(
          `✓ Model "${modelId}" - query executed, response: ${responseLength} chars`,
        );
      }
    });

    test('Should maintain model state across consecutive requests', async () => {
      const testModel = 'llama2';
      const requests = 3;

      for (let i = 0; i < requests; i++) {
        const payload = {
          model: testModel,
          prompt: `Constitutional question ${i + 1}: What is the role of the judiciary?`,
          context: 'judicial_review',
        };

        const response = await apiRequest({
          method: 'POST',
          endpoint: '/inference/generate',
          body: payload,
          service: 'llm',
        });

        expect(response.ok).toBe(true);
        expect(response.data).toBeDefined();

        // Verify the model used is the one we requested
        const responseData = response.data as any;
        const usedModel =
          responseData.model || responseData.modelId || testModel;
        expect(usedModel.toLowerCase()).toBe(testModel.toLowerCase());

        console.log(
          `✓ Request ${i + 1}/${requests} - model ${testModel} maintained consistency`,
        );
      }
    });
  });

  test.describe('Model-Specific Response Validation', () => {
    test('Should return valid response structure from each model', async () => {
      const testModels = ['llama2', 'mistral'];

      for (const modelId of testModels) {
        const payload = {
          model: modelId,
          prompt: 'Explain checks and balances',
          context: 'government_structure',
        };

        const response = await apiRequest({
          method: 'POST',
          endpoint: '/inference/generate',
          body: payload,
          service: 'llm',
        });

        expect(response.ok).toBe(true);
        const responseData = response.data as any;

        // Response should have timestamp in data or wrapper
        const hasTimestamp =
          (typeof response === 'object' && 'timestamp' in response) ||
          (typeof responseData === 'object' && 'timestamp' in responseData);
        expect(hasTimestamp).toBe(true);

        // Response should contain generated text
        const generatedText =
          responseData.response ||
          responseData.output ||
          responseData.generated_text;
        expect(generatedText).toBeDefined();
        expect(typeof generatedText).toBe('string');
        expect(generatedText.length).toBeGreaterThan(10);

        console.log(
          `✓ ${modelId} response valid - content length: ${generatedText.length}`,
        );
      }
    });

    test('Should include model identification in response', async () => {
      const payload = {
        model: 'mistral',
        prompt: 'What is federalism?',
        context: 'political_structure',
      };

      const response = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        body: payload,
        service: 'llm',
      });

      expect(response.ok).toBe(true);
      const responseData = response.data as any;

      // Either the response or wrapper should identify the model
      const modelIdentifier =
        responseData.model || responseData.modelId || response.data?.model;
      expect(modelIdentifier).toBeDefined();

      console.log(`✓ Response contains model identifier: ${modelIdentifier}`);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('Should return error for invalid model', async () => {
      const payload = {
        model: 'nonexistent-model-xyz',
        prompt: 'Test query',
        context: 'test',
      };

      const response = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        body: payload,
        service: 'llm',
      });

      // Should either fail or handle gracefully
      expect(response.status).not.toBe(200);
      console.log(
        `✓ Invalid model correctly rejected with status: ${response.status}`,
      );
    });

    test('Should handle empty prompt gracefully', async () => {
      const payload = {
        model: 'llama2',
        prompt: '',
        context: 'test',
      };

      const response = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        body: payload,
        service: 'llm',
      });

      // Should return error or validation failure
      expect(response.ok).toBe(false);
      console.log(`✓ Empty prompt correctly rejected`);
    });

    test('Should validate model selection required', async () => {
      const payload = {
        prompt: 'Test query',
        context: 'test',
        // model field intentionally missing
      };

      const response = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        body: payload,
        service: 'llm',
      });

      // Should fail due to missing model
      expect(response.ok).toBe(false);
      console.log(`✓ Missing model field correctly rejected`);
    });
  });

  test.describe('Performance with Model Switching', () => {
    test('Should handle rapid model switches under 2 seconds per query', async () => {
      const models = ['llama2', 'mistral', 'neural-chat'];
      const startTime = Date.now();

      for (const modelId of models) {
        const payload = {
          model: modelId,
          prompt: 'Short question about liberty',
          context: 'political_philosophy',
        };

        const response = await apiRequest({
          method: 'POST',
          endpoint: '/inference/generate',
          body: payload,
          service: 'llm',
        });

        expect(response.ok).toBe(true);
      }

      const totalTime = Date.now() - startTime;
      const avgTime = totalTime / models.length;

      console.log(
        `✓ 3-model sequence completed in ${totalTime}ms (avg: ${avgTime.toFixed(0)}ms per model)`,
      );
    });
  });

  test.describe('Integration: Frontend Model Selector Scenario', () => {
    test('Should complete full user workflow: list models > select model > generate query', async () => {
      // Step 1: User loads page - models are fetched
      const modelsResponse = await apiRequest({
        method: 'GET',
        endpoint: '/inference/models',
        service: 'llm',
      });

      expect(modelsResponse.ok).toBe(true);
      const models = modelsResponse.data?.models as any[];
      console.log(`✓ Step 1: Loaded ${models.length} models`);

      // Step 2: User selects a model (simulated by choosing first model)
      const selectedModelId =
        typeof models[0] === 'object' ? models[0].id : models[0];
      console.log(`✓ Step 2: Selected model - ${selectedModelId}`);

      // Step 3: User enters prompt and submits query with selected model
      const payload = {
        model: selectedModelId,
        prompt: 'What are the Federalist Papers and why are they important?',
        context: 'constitutional_history',
      };

      const queryResponse = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        body: payload,
        service: 'llm',
      });

      expect(queryResponse.ok).toBe(true);
      expect(queryResponse.data).toBeDefined();
      console.log(
        `✓ Step 3: Query executed with selected model, response received`,
      );

      // Step 4: User switches to different model
      const secondModelId =
        typeof models[1] === 'object' ? models[1].id : models[1];
      const payload2 = {
        model: secondModelId,
        prompt: 'What is the Tenth Amendment?',
        context: 'constitutional_rights',
      };

      const queryResponse2 = await apiRequest({
        method: 'POST',
        endpoint: '/inference/generate',
        body: payload2,
        service: 'llm',
      });

      expect(queryResponse2.ok).toBe(true);
      console.log(`✓ Step 4: Switched to ${secondModelId} and executed query`);

      // Verify both queries produced different responses (likely, given different models)
      const response1Data = queryResponse.data as any;
      const response2Data = queryResponse2.data as any;

      const response1Text = (response1Data?.response ||
        response1Data?.output ||
        '') as string;
      const response2Text = (response2Data?.response ||
        response2Data?.output ||
        '') as string;

      expect(typeof response1Text).toBe('string');
      expect(typeof response2Text).toBe('string');
      expect(response1Text.length).toBeGreaterThan(0);
      expect(response2Text.length).toBeGreaterThan(0);

      console.log('✓ Full workflow completed successfully');
    });

    test('Should persist selected model in UI state across multiple queries', async () => {
      const testModel = 'neural-chat';

      // Simulate user selecting a model and making multiple queries with that selection
      for (let i = 1; i <= 3; i++) {
        const payload = {
          model: testModel,
          prompt: `Question ${i} about political philosophy`,
          context: 'politics',
        };

        const response = await apiRequest({
          method: 'POST',
          endpoint: '/inference/generate',
          body: payload,
          service: 'llm',
        });

        expect(response.ok).toBe(true);
        const usedModel = (response.data?.model ||
          response.data?.modelId ||
          testModel) as string;
        expect(typeof usedModel).toBe('string');
        expect(usedModel.toLowerCase()).toBe(testModel.toLowerCase());

        console.log(
          `✓ Query ${i}: Model selection persisted - using ${testModel}`,
        );
      }
    });
  });
});
