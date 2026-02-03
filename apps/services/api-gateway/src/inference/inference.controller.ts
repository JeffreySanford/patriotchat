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

@Controller('inference')
export class InferenceController {
  constructor(private inferenceService: InferenceService) {}

  @Get('models')
  async getModels(): Promise<{ models: string[] }> {
    try {
      console.log('InferenceController: getModels called');
      const models: string[] = await this.inferenceService.getModels();
      console.log('InferenceController: returning models:', models);
      return { models };
    } catch (err: unknown) {
      console.error('InferenceController: error in getModels:', err);
      // Return default models even if service fails
      return { models: ['llama2', 'mistral', 'neural-chat'] };
    }
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateInference(
    @Body() body: { prompt: string; model: string; context?: string },
  ): Promise<{ result: string; model: string; tokens: number; duration: string }> {
    try {
      console.log('InferenceController: generateInference called with body:', body);
      const result: { result: string; model: string; tokens: number; duration: string } = await this.inferenceService.generateInference(
        body.prompt,
        body.model,
        body.context,
      );
      console.log('InferenceController: returning result:', result);
      return result;
    } catch (err: unknown) {
      console.error('InferenceController: error in generateInference:', err);
      const error = err as Record<string, unknown>;
      throw new HttpException(
        (error.message as string) || 'Inference generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
