/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

export interface InferenceResponse {
  result: string;
  model: string;
  tokens: number;
  duration: string;
}

export interface ModelsResponse {
  models: string[];
}

@Injectable({ providedIn: 'root' })
export class LlmService {
  private readonly API_URL: string = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  getModels(): Observable<ModelsResponse> {
    return this.http.get<ModelsResponse>(`${this.API_URL}/inference/models`);
  }

  generateInference(
    prompt: string,
    model: string,
    context?: string,
  ): Observable<InferenceResponse> {
    const token: string | null = this.authService.getToken();
    return this.http.post<InferenceResponse>(
      `${this.API_URL}/inference/generate`,
      { prompt, model, context, user_id: 'current-user' },
      {
        headers: { Authorization: `Bearer ${token || ''}` },
      },
    );
  }
}
