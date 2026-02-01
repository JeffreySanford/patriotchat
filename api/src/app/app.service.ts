import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { PipelineTelemetryService } from './pipeline-telemetry.service';

export interface StatusIndicator {
  label: string;
  detail: string;
  state: 'healthy' | 'warning' | 'critical';
}

export interface ApiStatusResponse {
  revision: string;
  uptimeMs: number;
  activeModel: string;
  guardrailPassRate: number;
  indicators: StatusIndicator[];
}

export interface QueryResult {
  response: string;
  latencyMs?: number;
}

@Injectable()
export class AppService {
  private readonly heavyUrl: string = process.env.HEAVY_URL ?? 'http://localhost:4000';
  private readonly logger: Logger = new Logger(AppService.name);

  constructor(
    private readonly http: HttpService,
    private readonly telemetry: PipelineTelemetryService,
  ) {}

  async executeQuery(prompt: string): Promise<QueryResult> {
    this.telemetry.recordStage('frontToApi', 'processing');
    this.telemetry.recordStage('apiToGo', 'idle');
    const frontStart: number = Date.now();
    const heavyStart: number = Date.now();
    this.telemetry.recordStage('apiToGo', 'processing');
    this.telemetry.recordStage('goToLlm', 'processing');
    try {
      const response: AxiosResponse<{ response: string }> = await lastValueFrom(
        this.http.get(`${this.heavyUrl}/llm`, {
          params: { q: prompt },
          responseType: 'json',
        }),
      );
      const heavyLatency: number = Number(response.headers['x-go-to-llm-latency']) || 0;
      const apiToGoLatency: number = Date.now() - heavyStart;
      const frontToApiLatency: number = Date.now() - frontStart;

      this.logger.debug('Heavy /llm responded', {
        status: response.status,
        payload: response.data,
      });

      this.telemetry.recordStage('goToLlm', 'success', heavyLatency);
      this.telemetry.recordStage('apiToGo', 'success', apiToGoLatency);
      this.telemetry.recordStage('frontToApi', 'success', frontToApiLatency);

      return {
        response: response.data.response,
        latencyMs: heavyLatency,
      };
    } catch (error) {
      const apiToGoLatency: number = Date.now() - heavyStart;
      const frontToApiLatency: number = Date.now() - frontStart;
      this.telemetry.recordStage('apiToGo', 'error', apiToGoLatency);
      this.telemetry.recordStage('frontToApi', 'error', frontToApiLatency);
      this.telemetry.recordStage('goToLlm', 'error', null);
      const normalizedError: Error =
        error instanceof Error ? error : new Error(String(error ?? 'Unknown error'));
      this.logger.error('Heavy /llm call failed', {
        error: normalizedError.message,
        prompt,
      });
      throw normalizedError;
    }
  }

  getData(): { message: string } {
    return { message: 'Hello API' };
  }

  getStatus(): ApiStatusResponse {
    return {
      revision: '2026.02.01-rc',
      uptimeMs: 4_560_000,
      activeModel: 'gpt-4.1-local',
      guardrailPassRate: 98.5,
      indicators: [
        {
          label: 'LLM latency',
          detail: '220ms average · 5 retries',
          state: 'warning',
        },
        {
          label: 'Guardrail pass rate',
          detail: '98.5% of prompts passed the policy checks',
          state: 'healthy',
        },
        {
          label: 'Telemetry pipeline',
          detail: 'Batch upload delayed for 5 min',
          state: 'warning',
        },
      ],
    };
  }
}
