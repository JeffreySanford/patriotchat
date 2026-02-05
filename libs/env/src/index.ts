/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import path from 'path';
import dotenv from 'dotenv';

import { SERVICE_PORTS } from './ports';

const envPath: string = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

function resolvePort(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value.trim() : fallback;
}

export const AUTH_PORT: string = resolvePort(
  process.env.AUTH_PORT,
  SERVICE_PORTS.auth,
);
export const FUNDING_PORT: string = resolvePort(
  process.env.FUNDING_PORT,
  SERVICE_PORTS.funding,
);
export const POLICY_PORT: string = resolvePort(
  process.env.POLICY_PORT,
  SERVICE_PORTS.policy,
);
export const LLM_PORT: string = resolvePort(
  process.env.LLM_PORT,
  SERVICE_PORTS.llm,
);
export const ANALYTICS_PORT: string = resolvePort(
  process.env.ANALYTICS_PORT,
  SERVICE_PORTS.analytics,
);
export const POSTGRES_PORT: string = resolvePort(
  process.env.POSTGRES_PORT,
  SERVICE_PORTS.postgres,
);
export const OLLAMA_PORT: string = resolvePort(
  process.env.OLLAMA_PORT,
  SERVICE_PORTS.ollama,
);

export const AUTH_URL: string =
  process.env.AUTH_URL ?? `http://localhost:${AUTH_PORT}`;
export const FUNDING_URL: string =
  process.env.FUNDING_URL ?? `http://localhost:${FUNDING_PORT}`;
export const POLICY_URL: string =
  process.env.POLICY_URL ?? `http://localhost:${POLICY_PORT}`;
export const LLM_URL: string =
  process.env.LLM_URL ?? `http://localhost:${LLM_PORT}`;
export const ANALYTICS_URL: string =
  process.env.ANALYTICS_URL ?? `http://localhost:${ANALYTICS_PORT}`;

export const TEST_USER_EMAIL: string =
  process.env.TEST_USER_EMAIL || 'test@example.com';
export const TEST_USER_PASSWORD: string =
  process.env.TEST_USER_PASSWORD || 'pass123';
export const TEST_USER_USERNAME: string =
  process.env.TEST_USER_USERNAME || 'testuser';
