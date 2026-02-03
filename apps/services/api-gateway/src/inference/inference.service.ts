import { Injectable, BadGatewayException } from '@nestjs/common';
import axios from 'axios';
import { InferenceModelsResponse, InferenceGenerateResponse, ApiError } from '@patriotchat/shared';

@Injectable()
export class InferenceService {
  private llmServiceUrl: string =
    process.env.LLM_SERVICE_URL || 'http://localhost:5000';

  async getModels(): Promise<string[]> {
    try {
      console.log(`Fetching models from: ${this.llmServiceUrl}/models`);
      const response = await axios.get<{ models: string[] }>(
        `${this.llmServiceUrl}/models`,
        { timeout: 5000 },
      );
      console.log('Models response:', response.data);
      return response.data.models || ['llama2', 'mistral', 'neural-chat'];
    } catch (error: unknown) {
      console.error('Error fetching models from LLM service:', error);
      console.warn('Returning default models due to LLM service error');
      throw new BadGatewayException(
        new ApiError({
          status: 502,
          message: 'LLM service unavailable',
          code: 'LLM_SERVICE_ERROR',
          details: { service: 'LLM', endpoint: '/models' },
        }),
      );
    }
  }

  async generateInference(
    prompt: string,
    model: string,
    context?: string,
  ): Promise<InferenceGenerateResponse> {
    try {
      console.log(`Generating inference with model ${model} at ${this.llmServiceUrl}/generate`);
      const response = await axios.post<InferenceGenerateResponse>(
        `${this.llmServiceUrl}/generate`,
        {
          prompt,
          model,
          context,
        },
        { timeout: 30000 },
      );

      console.log('Generation response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error generating inference:', error);
      const err = error as Record<string, unknown>;

      // Check for connection refused
      if ((err.code as string) === 'ECONNREFUSED' || (err.code as string) === 'ENOTFOUND') {
        console.warn('LLM service unavailable');
        throw new BadGatewayException(
          new ApiError({
            status: 502,
            message: 'LLM service unavailable',
            code: 'LLM_SERVICE_ERROR',
            details: { service: 'LLM', endpoint: '/generate' },
          }),
        );
      }

      throw new BadGatewayException(
        new ApiError({
          status: 502,
          message: 'Failed to generate inference',
          code: 'INFERENCE_ERROR',
          details: {
            service: 'LLM',
            originalError: (err.message as string) || 'Unknown error',
          },
        }),
      );
    }
  }
}
