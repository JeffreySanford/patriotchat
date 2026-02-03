import { Injectable } from '@nestjs/common';
import axios from 'axios';

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
    } catch (error) {
      console.error('Error fetching models from LLM service:', error);
      console.warn('Returning default models due to LLM service error');
      // Return default models if service is unavailable
      return ['llama2', 'mistral', 'neural-chat'];
    }
  }

  async generateInference(
    prompt: string,
    model: string,
    context?: string,
  ): Promise<{ result: string; model: string; tokens: number; duration: string }> {
    try {
      console.log(`Generating inference with model ${model} at ${this.llmServiceUrl}/generate`);
      const response = await axios.post<{
        result: string;
        tokens: number;
        duration: number;
      }>(
        `${this.llmServiceUrl}/generate`,
        {
          prompt,
          model,
          context,
        },
        { timeout: 30000 },
      );

      console.log('Generation response:', response.data);
      return {
        result: response.data.result,
        model,
        tokens: response.data.tokens || 0,
        duration: `${response.data.duration || 0}ms`,
      };
    } catch (error: unknown) {
      console.error('Error generating inference:', error);
      const err = error as any;
      // For now, return a mock response if service is unavailable
      if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        console.warn('LLM service unavailable, returning mock response');
        return {
          result: `This is a mock response for: "${prompt}" using ${model} model.`,
          model,
          tokens: 150,
          duration: '500ms',
        };
      }
      throw new Error(
        err.response?.data?.error || err.message || 'Failed to generate inference',
      );
    }
  }
}
