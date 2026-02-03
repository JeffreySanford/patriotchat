/**
 * API DTOs for api-gateway
 * These are local copies of shared DTOs to work around module resolution issues
 * with the dev server. In production builds, these are replaced with imports from
 * @patriotchat/shared.
 */

export interface InferenceModel {
  id: string;
  name: string;
  description: string;
  provider: string;
}

export interface InferenceModelsResponse {
  models: InferenceModel[];
}

export interface InferenceGenerateRequest {
  prompt: string;
  model: string;
  context?: string;
}

export interface InferenceGenerateResponse {
  prompt: string;
  text: string;
  model: string;
  tokens: number;
  duration: number;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, no-restricted-syntax
    public details?: Record<string, any>,
    message?: string,
  ) {
    super(message || code);
    this.name = 'ApiError';
  }
}
