import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { InferenceService } from './inference.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  InferenceModelsResponse,
  InferenceGenerateRequest,
  InferenceGenerateResponse,
} from '@patriotchat/shared';

@Controller('inference')
export class InferenceController {
  constructor(private inferenceService: InferenceService) {}

  @Get('models')
  async getModels(): Promise<InferenceModelsResponse> {
    try {
      console.log('InferenceController: getModels called');
      const modelNames: string[] = await this.inferenceService.getModels();
      console.log('InferenceController: returning models:', modelNames);
      // Convert model names to model objects
      const models = modelNames.map((name) => ({
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        description: `${name} language model`,
        provider: 'LLM Service',
      }));
      return { models };
    } catch (err: unknown) {
      console.error('InferenceController: error in getModels:', err);
      throw new HttpException(
        'Failed to fetch models',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateInference(
    @Body() body: InferenceGenerateRequest,
  ): Promise<InferenceGenerateResponse> {
    try {
      console.log('InferenceController: generateInference called with body:', body);
      const modelId = body.modelId || body.model;
      if (!modelId) {
        throw new HttpException(
          'Model ID is required',
          HttpStatus.BAD_REQUEST,
        );
      }
      const result: InferenceGenerateResponse = await this.inferenceService.generateInference(
        body.prompt,
        modelId,
        body.context,
      );
      console.log('InferenceController: returning result:', result);
      return result;
    } catch (err: unknown) {
      console.error('InferenceController: error in generateInference:', err);
      const error = err as Record<string, unknown>;
      throw new HttpException(
        (error.message as string) || 'Inference generation failed',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
