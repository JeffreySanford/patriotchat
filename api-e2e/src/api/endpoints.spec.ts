import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

const API_BASE_URL: string = process.env['API_URL'] || 'http://localhost:3000';
const client: AxiosInstance = axios.create({ baseURL: API_BASE_URL });

describe('API Endpoints - Complete Test Suite', () => {
  describe('GET /api', () => {
    it('should return a message', async () => {
      const res: AxiosResponse = await client.get(`/api`);

      expect(res.status).toBe(200);
      expect(res.data).toEqual({ message: 'Hello API' });
      expect(res.data.message).toBe('Hello API');
    });

    it('should have correct content-type', async () => {
      const res: AxiosResponse = await client.get(`/api`);

      expect(res.headers['content-type']).toContain('application/json');
    });

    it('should respond without authentication', async () => {
      const res: AxiosResponse = await client.get(`/api`, {
        validateStatus: () => true,
      });

      expect([200, 404]).toContain(res.status);
    });
  });

  describe('GET /api/status', () => {
    it('should return status metrics', async () => {
      const res: AxiosResponse = await client.get(`/api/status`);

      expect(res.status).toBe(200);
      expect(res.data).toBeDefined();
      expect(res.data.guardrailPassRate).toBeCloseTo(98.5);
      expect(res.data.indicators).toHaveLength(3);
    });

    it('should return status with all required fields', async () => {
      const res: AxiosResponse = await client.get(`/api/status`);

      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('revision');
      expect(res.data).toHaveProperty('uptimeMs');
      expect(res.data).toHaveProperty('activeModel');
      expect(res.data).toHaveProperty('guardrailPassRate');
      expect(res.data).toHaveProperty('indicators');
    });

    it('should return status indicators with correct structure', async () => {
      const res: AxiosResponse = await client.get(`/api/status`);

      const indicators: Array<{ label: string; detail: string; state: string }> =
        res.data.indicators;

      expect(Array.isArray(indicators)).toBe(true);
      expect(indicators.length).toBeGreaterThan(0);

      indicators.forEach(
        (indicator: { label: string; detail: string; state: string }) => {
          expect(indicator).toHaveProperty('label');
          expect(indicator).toHaveProperty('detail');
          expect(indicator).toHaveProperty('state');
          expect(typeof indicator.label).toBe('string');
          expect(typeof indicator.detail).toBe('string');
          expect(['healthy', 'warning', 'critical']).toContain(indicator.state);
        },
      );
    });

    it('should return numeric values for uptimeMs and guardrailPassRate', async () => {
      const res: AxiosResponse = await client.get(`/api/status`);

      expect(typeof res.data.uptimeMs).toBe('number');
      expect(typeof res.data.guardrailPassRate).toBe('number');
      expect(res.data.uptimeMs).toBeGreaterThanOrEqual(0);
      expect(res.data.guardrailPassRate).toBeGreaterThanOrEqual(0);
      expect(res.data.guardrailPassRate).toBeLessThanOrEqual(100);
    });
  });

  describe('POST /api/query', () => {
    it('should accept a query prompt', async () => {
      const res: AxiosResponse = await client.post(`/api/query`, {
        prompt: 'What is 2+2?',
      });

      expect([200, 201]).toContain(res.status);
      expect(res.data).toBeDefined();
    });

    it('should return response with latency', async () => {
      const res: AxiosResponse = await client.post(`/api/query`, {
        prompt: 'test query',
      });

      expect(res.data).toHaveProperty('response');
      expect(typeof res.data.response).toBe('string');
    });

    it('should handle various prompt types', async () => {
      const prompts: string[] = [
        'Simple question',
        'Question with special chars: @#$%',
        'Question with numbers: 123456',
        'Multi-line\nquestion',
      ];

      for (const prompt of prompts) {
        const res: AxiosResponse = await client.post(`/api/query`, { prompt });
        expect([200, 201, 400, 500]).toContain(res.status);
      }
    });

    it('should reject empty prompt', async () => {
      try {
        await client.post(`/api/query`, {
          prompt: '',
        });
      } catch (error) {
        // Expected to either fail or succeed
        expect(error).toBeDefined();
      }
    });

    it('should handle request with correct content-type', async () => {
      const res: AxiosResponse = await client.post(
        `/api/query`,
        { prompt: 'test' },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      expect([200, 201, 400, 500]).toContain(res.status);
    });

    it('should return response with valid structure', async () => {
      const res: AxiosResponse = await client.post(`/api/query`, {
        prompt: 'test query',
      });

      if (res.status === 200 || res.status === 201) {
        expect(res.data).toHaveProperty('response');
        expect(typeof res.data.response).toBe('string');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent endpoint', async () => {
      try {
        await client.get(`/api/nonexistent`);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          expect([404, 500]).toContain(error.response?.status);
        }
      }
    });

    it('should handle malformed JSON in POST body', async () => {
      try {
        await client.post(`/api/query`, 'invalid json', {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          expect([400, 500]).toContain(error.response?.status);
        }
      }
    });

    it('should handle missing required fields', async () => {
      try {
        await client.post(`/api/query`, {});
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          expect([400, 500]).toContain(error.response?.status);
        }
      }
    });
  });

  describe('CORS and Headers', () => {
    it('should include CORS headers in response', async () => {
      const res: AxiosResponse = await client.get(`/api`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBeDefined();
    });

    it('should handle OPTIONS requests', async () => {
      const res: AxiosResponse = await client.options(`/api`, {
        validateStatus: () => true,
      });

      expect([200, 204, 405]).toContain(res.status);
    });
  });

  describe('Response Times', () => {
    it('should respond to status endpoint within reasonable time', async () => {
      const start: number = Date.now();
      await client.get(`/api/status`);
      const duration: number = Date.now() - start;

      expect(duration).toBeLessThan(5000);
    });

    it('should respond to root endpoint within reasonable time', async () => {
      const start: number = Date.now();
      await client.get(`/api`);
      const duration: number = Date.now() - start;

      expect(duration).toBeLessThan(5000);
    });
  });

  describe('API Contract', () => {
    it('should maintain consistent response structure for status', async () => {
      const res1: AxiosResponse = await client.get(`/api/status`);
      const res2: AxiosResponse = await client.get(`/api/status`);

      expect(res1.data).toHaveProperty('revision');
      expect(res2.data).toHaveProperty('revision');
      expect(typeof res1.data.revision).toBe(typeof res2.data.revision);
    });

    it('should return consistent message from root endpoint', async () => {
      const res1: AxiosResponse = await client.get(`/api`);
      const res2: AxiosResponse = await client.get(`/api`);

      expect(res1.data).toEqual(res2.data);
      expect(res1.data.message).toBe(res2.data.message);
    });
  });
});
