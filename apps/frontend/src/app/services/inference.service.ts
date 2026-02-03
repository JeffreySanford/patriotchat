import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  InferenceModelsResponse,
  InferenceGenerateRequest,
  InferenceGenerateResponse,
} from '../types/api.dto';

/**
 * Frontend Inference Service
 * Communicates with backend inference API
 * All responses are typed through DTOs - no any/unknown needed!
 */
@Injectable({
  providedIn: 'root',
})
export class InferenceService {
  private readonly apiUrl: string = '/inference';

  constructor(private http: HttpClient) {}

  /**
   * Get available LLM models
   * Returns Observable<InferenceModelsResponse> - fully typed!
   */
  getModels(): Observable<{ data: InferenceModelsResponse; timestamp: number; status: number }> {
    return this.http.get<{ data: InferenceModelsResponse; timestamp: number; status: number }>(
      `${this.apiUrl}/models`,
    );
  }

  /**
   * Generate inference from LLM
   * Request and response are both typed
   */
  generateInference(
    body: InferenceGenerateRequest,
  ): Observable<{ data: InferenceGenerateResponse; timestamp: number; status: number }> {
    return this.http.post<{ data: InferenceGenerateResponse; timestamp: number; status: number }>(
      `${this.apiUrl}/generate`,
      body,
    );
  }
}
