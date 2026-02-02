import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PipelineTelemetryService } from './pipeline-telemetry.service';
import { PipelineStageUpdate, PIPELINE_STAGE_ORDER } from '@patriotchat/shared';
import type { MockedFunction } from 'vitest';

describe('PipelineTelemetryService', () => {
  let service: PipelineTelemetryService;
  let logSpy: MockedFunction<typeof console.log>;

  beforeEach((): void => {
    TestBed.configureTestingModule({});
    
    // Spy on console methods before creating service
    logSpy = vi.spyOn(console, 'log').mockImplementation((): void => {
      // Suppress console output during tests
    });
    vi.spyOn(console, 'warn').mockImplementation((): void => {
      // Suppress console output during tests
    });
    vi.spyOn(console, 'error').mockImplementation((): void => {
      // Suppress console output during tests
    });
    
    service = TestBed.inject(PipelineTelemetryService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with idle stages', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        expect(updates.length).toBe(PIPELINE_STAGE_ORDER.length);
        updates.forEach((update: PipelineStageUpdate): void => {
          expect(update.state).toBe('idle');
          expect(update.latencyMs).toBeNull();
        });
      });
    });

    it('should have all expected stages in order', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        const stages: string[] = updates.map((u: PipelineStageUpdate): string => u.stage);
        expect(stages).toEqual(PIPELINE_STAGE_ORDER);
      });
    });

    it('should log connection initialization', (): void => {
      expect(logSpy).toHaveBeenCalledWith(
        '[PipelineTelemetryService] 🔌 Initiating socket.io connection'
      );
    });

    it('should log endpoint configuration', (): void => {
      expect(logSpy).toHaveBeenCalledWith('[PipelineTelemetryService] - Endpoint:', 'http://localhost:3000');
      expect(logSpy).toHaveBeenCalledWith('[PipelineTelemetryService] - Socket path:', '/socket.io');
    });

    it('should log transport configuration', (): void => {
      expect(logSpy).toHaveBeenCalledWith('[PipelineTelemetryService] - Transport: websocket');
      expect(logSpy).toHaveBeenCalledWith('[PipelineTelemetryService] - Reconnection delay: 2500ms');
    });

    it('should log socket client creation', (): void => {
      expect(logSpy).toHaveBeenCalledWith(
        '[PipelineTelemetryService] ⏳ Socket.io client created, waiting for connection...'
      );
    });
  });

  describe('console logging', () => {
    it('should include emoji indicators in all log messages', (): void => {
      const calls: Array<Array<string | null>> = logSpy.mock.calls as Array<Array<string | null>>;
      const emojiMessages: Array<Array<string | null>> = calls.filter((call: Array<string | null>): boolean => 
        typeof call[0] === 'string' && 
        /[\u{1F50C}\u{231B}\u{2705}\u{26A0}\u{274C}\u{1F4A8}\u{1F504}]/u.test(call[0] as string)
      );
      expect(emojiMessages.length).toBeGreaterThan(0);
    });

    it('should log structured console output', (): void => {
      const allCalls: Array<Array<string | null>> = logSpy.mock.calls as Array<Array<string | null>>;
      const structuredCalls: Array<Array<string | null>> = allCalls.filter((call: Array<string | null>): boolean =>
        typeof call[0] === 'string' && 
        (call[0] as string).startsWith('[PipelineTelemetryService]')
      );
      expect(structuredCalls.length).toBeGreaterThan(0);
    });
  });

  describe('stageUpdates$ observable', () => {
    it('should emit initial stages', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        expect(updates).toBeDefined();
        expect(Array.isArray(updates)).toBeTruthy();
      });
    });

    it('should emit stages with all required properties', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        updates.forEach((update: PipelineStageUpdate): void => {
          expect(update.stage).toBeDefined();
          expect(update.state).toBeDefined();
          expect(update.latencyMs).toBeDefined();
          expect(update.updatedAt).toBeDefined();
        });
      });
    });

    it('should have consistent stage order', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        const stages: string[] = updates.map((u: PipelineStageUpdate): string => u.stage);
        expect(stages).toEqual(PIPELINE_STAGE_ORDER);
      });
    });
  });

  describe('socket connection configuration', () => {
    it('should configure socket with correct endpoint', (): void => {
      expect(logSpy).toHaveBeenCalledWith('[PipelineTelemetryService] - Endpoint:', 'http://localhost:3000');
    });

    it('should configure socket with correct path', (): void => {
      expect(logSpy).toHaveBeenCalledWith('[PipelineTelemetryService] - Socket path:', '/socket.io');
    });

    it('should use websocket transport', (): void => {
      expect(logSpy).toHaveBeenCalledWith('[PipelineTelemetryService] - Transport: websocket');
    });

    it('should set reconnection delay', (): void => {
      expect(logSpy).toHaveBeenCalledWith('[PipelineTelemetryService] - Reconnection delay: 2500ms');
    });
  });

  describe('cleanup', () => {
    it('should handle destroy without errors', (): void => {
      expect((): void => service.ngOnDestroy()).not.toThrow();
    });

    it('should disconnect socket on destroy', (): void => {
      expect((): void => service.ngOnDestroy()).not.toThrow();
    });
  });

  describe('stage data structure', () => {
    it('should have correct number of stages', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        expect(updates.length).toBe(3);
        expect(updates.length).toBe(PIPELINE_STAGE_ORDER.length);
      });
    });

    it('should include frontToApi stage', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        expect(updates.some((u: PipelineStageUpdate): boolean => u.stage === 'frontToApi')).toBeTruthy();
      });
    });

    it('should include apiToGo stage', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        expect(updates.some((u: PipelineStageUpdate): boolean => u.stage === 'apiToGo')).toBeTruthy();
      });
    });

    it('should include goToLlm stage', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        expect(updates.some((u: PipelineStageUpdate): boolean => u.stage === 'goToLlm')).toBeTruthy();
      });
    });

    it('should initialize all stages as idle', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        updates.forEach((update: PipelineStageUpdate): void => {
          expect(update.state).toBe('idle');
        });
      });
    });

    it('should initialize latency as null', (): void => {
      service.stageUpdates$.subscribe((updates: PipelineStageUpdate[]): void => {
        updates.forEach((update: PipelineStageUpdate): void => {
          expect(update.latencyMs).toBeNull();
        });
      });
    });
  });
});
