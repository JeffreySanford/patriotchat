import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { ApiStatusResponse, AppService } from './app.service';
import { PipelineTelemetryService } from './pipeline-telemetry.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      imports: [HttpModule],
      controllers: [AppController],
      providers: [AppService, PipelineTelemetryService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const appController: AppController =
        app.get<AppController>(AppController);
      expect(appController.getData()).toEqual({ message: 'Hello API' });
    });
  });

  describe('getStatus', () => {
    it('should return the status payload', () => {
      const appController: AppController =
        app.get<AppController>(AppController);
      const status: ApiStatusResponse = appController.getStatus();

      expect(status.guardrailPassRate).toBeCloseTo(98.5);
      expect(status.indicators).toHaveLength(3);
      expect(status.activeModel).toContain('gpt-4.1');
    });
  });
});
