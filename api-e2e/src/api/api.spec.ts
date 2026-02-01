import axios from 'axios';
import type { AxiosResponse } from 'axios';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res: AxiosResponse = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});

describe('GET /api/status', () => {
  it('should return status metrics', async () => {
    const res: AxiosResponse = await axios.get(`/api/status`);

    expect(res.status).toBe(200);
    expect(res.data.guardrailPassRate).toBeCloseTo(98.5);
    expect(res.data.indicators).toHaveLength(3);
  });
});
