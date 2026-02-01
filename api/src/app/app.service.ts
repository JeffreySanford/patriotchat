import { Injectable } from '@nestjs/common';

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

@Injectable()
export class AppService {
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
