import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Inject,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InferenceService } from './inference.service';
import {
  InferenceModelsResponse,
  InferenceGenerateRequest,
  InferenceGenerateResponse,
} from '../types/api.dto';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Controller('inference')
export class InferenceController {
  constructor(@Inject(InferenceService) private readonly inferenceService: InferenceService) {}

  @Get('models')
  getModels(): Observable<InferenceModelsResponse> {
    console.log('InferenceController: getModels called');
    return this.inferenceService.getModels().pipe(
      map((modelIds) => ({
        models: modelIds.map((id) => ({
          id,
          name: id,
          description: `${id} language model`,
          provider: 'Local',
        })),
      })),
      catchError((err: any) => {
        console.error('InferenceController: error in getModels:', err);
        throw new HttpException(
          'Failed to fetch models',
          HttpStatus.BAD_GATEWAY,
        );
      }),
    );
  }

  @Post('generate')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  generateInference(
    @Body() body: InferenceGenerateRequest,
  ): Observable<InferenceGenerateResponse> {
    console.log('InferenceController: generateInference called with body:', body);
    // Support both 'model' and 'modelId' field names
    const bodyAny = body as unknown as Record<string, unknown>;
    const modelId = bodyAny['model'] || bodyAny['modelId'];
    
    if (!modelId) {
      throw new HttpException(
        'Model is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.inferenceService.generateInference(body.prompt, modelId as string, body.context).pipe(
      catchError((err: any) => {
        console.error('InferenceController: error in generateInference:', err);
        throw new HttpException(
          err?.message || 'Inference generation failed',
          HttpStatus.BAD_GATEWAY,
        );
      }),
    );
  }
}
