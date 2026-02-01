import { Test, TestingModule } from '@nestjs/testing';
import { ApiStatusResponse, AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get<AppService>(AppService);
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      expect(service.getData()).toEqual({ message: 'Hello API' });
    });
  });

  describe('getStatus', () => {
    it('should expose the status payload', () => {
      const status: ApiStatusResponse = service.getStatus();

      expect(status.guardrailPassRate).toBeCloseTo(98.5);
      expect(status.indicators.length).toBeGreaterThan(0);
      expect(status.activeModel).toContain('gpt-4.1');
    });
  });
});
