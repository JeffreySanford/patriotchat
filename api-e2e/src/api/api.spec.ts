import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

const API_BASE_URL: string = process.env['API_URL'] || 'http://localhost:3000';
const client: AxiosInstance = axios.create({ baseURL: API_BASE_URL });

describe('GET /api', () => {
  it('should return a message', async () => {
    const res: AxiosResponse = await client.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});

describe('GET /api/status', () => {
  it('should return status metrics', async () => {
    const res: AxiosResponse = await client.get(`/api/status`);

    expect(res.status).toBe(200);
    expect(res.data.guardrailPassRate).toBeCloseTo(98.5);
    expect(res.data.indicators).toHaveLength(3);
  });
});
