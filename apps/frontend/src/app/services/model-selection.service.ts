import { Injectable } from '@angular/core';
import { BehaviorSubject, take } from 'rxjs';
import { InferenceService } from './inference.service';
import { InferenceModelsResponse } from '../types/api.dto';

type ModelInfo = InferenceModelsResponse['models'][number];

@Injectable({
  providedIn: 'root',
})
export class ModelSelectionService {
  private readonly modelsSubject: BehaviorSubject<ModelInfo[]> =
    new BehaviorSubject<ModelInfo[]>([]);
  private readonly selectedModelSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

  readonly models$: ReturnType<BehaviorSubject<ModelInfo[]>['asObservable']> =
    this.modelsSubject.asObservable();
  readonly selectedModel$: ReturnType<
    BehaviorSubject<string | null>['asObservable']
  > = this.selectedModelSubject.asObservable();

  constructor(private readonly inferenceService: InferenceService) {
    this.refreshModels();
  }

  refreshModels(): void {
    this.inferenceService
      .getModels()
      .pipe(take(1))
      .subscribe({
        next: (response: InferenceModelsResponse) => {
          const models: ModelInfo[] = response.data.models;
          if (Array.isArray(models) && models.length > 0) {
            this.modelsSubject.next(models);
            if (!this.selectedModelSubject.value) {
              this.selectedModelSubject.next(models[0].id);
            }
          }
        },
        error: (err: Error) => {
          console.error('ModelSelectionService: failed to load models', err);
        },
      });
  }

  selectModel(modelId: string): void {
    this.selectedModelSubject.next(modelId);
  }
}
