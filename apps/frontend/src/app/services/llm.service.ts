import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

interface InferenceResponse {
  result: string;
  model: string;
  tokens: number;
  duration: string;
}

interface ModelsResponse {
  models: string[];
}

@Injectable({ providedIn: 'root' })
export class LlmService {
  private readonly API_URL = 'http://localhost:3000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getModels(): Observable<ModelsResponse> {
    return this.http.get<ModelsResponse>(`${this.API_URL}/inference/models`);
  }

  generateInference(
    prompt: string,
    model: string,
    context?: string
  ): Observable<InferenceResponse> {
    const token = this.authService.getToken();
    return this.http.post<InferenceResponse>(
      `${this.API_URL}/inference/generate`,
      { prompt, model, context, user_id: 'current-user' },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  }
}
