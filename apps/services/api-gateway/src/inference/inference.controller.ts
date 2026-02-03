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
  async getModels() {
    try {
      console.log('InferenceController: getModels called');
      const models = await this.inferenceService.getModels();
      console.log('InferenceController: returning models:', models);
      return { models };
    } catch (error: unknown) {
      console.error('InferenceController: error in getModels:', error);
      // Return default models even if service fails
      return { models: ['llama2', 'mistral', 'neural-chat'] };
    }
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateInference(
    @Body() body: { prompt: string; model: string; context?: string },
  ) {
    try {
      console.log('InferenceController: generateInference called with body:', body);
      const result = await this.inferenceService.generateInference(
        body.prompt,
        body.model,
        body.context,
      );
      console.log('InferenceController: returning result:', result);
      return result;
    } catch (error: unknown) {
      console.error('InferenceController: error in generateInference:', error);
      const err = error as any;
      throw new HttpException(
        err.message || 'Inference generation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
