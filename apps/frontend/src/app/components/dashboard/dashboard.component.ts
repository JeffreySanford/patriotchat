import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { InferenceService } from '../../services/inference.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { ApiError, InferenceModelsResponse, InferenceGenerateResponse } from '../../types/api.dto';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

interface Model {
  id: string;
  name: string;
  description?: string;
  provider?: string;
  contextWindow?: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit {
  selectedModel: string | null = null;
  availableModels: Model[] = [];
  messages: Message[] = [];
  userPrompt: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private inferenceService: InferenceService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.inferenceService.getModels().subscribe({
      next: (response: { data: InferenceModelsResponse; timestamp: number; status: number }): void => {
        console.log('Dashboard: Models loaded:', response.data.models);
        this.availableModels = response.data.models;
        if (this.availableModels.length > 0) {
          this.selectedModel = this.availableModels[0].id;
          console.log('Dashboard: Selected default model:', this.selectedModel);
        }
      },
      error: (err: ApiError | HttpErrorResponse): void => {
        this.error = err instanceof ApiError ? err.message : 'Failed to load models';
        console.error('Dashboard: Error loading models:', err);
      },
    });
  }

  selectModel(modelId: string): void {
    this.selectedModel = modelId;
    this.analyticsService.trackEvent('model_selected', { model: modelId }).subscribe({
      error: (err: ApiError | HttpErrorResponse): void =>
        console.error('Analytics error:', err),
    });
  }

  sendMessage(): void {
    if (!this.userPrompt.trim() || !this.selectedModel || this.loading) {
      return;
    }

    const userMessage: string = this.userPrompt;
    this.messages.push({ role: 'user', content: userMessage });
    this.userPrompt = '';
    this.loading = true;
    this.error = '';

    this.inferenceService
      .generateInference({
        modelId: this.selectedModel,
        prompt: userMessage,
      })
      .subscribe({
        next: (response: { data: InferenceGenerateResponse; timestamp: number; status: number }): void => {
          const assistantText: string = response.data.result || response.data.text || '';
          this.messages.push({
            role: 'assistant',
            content: assistantText,
            model: this.selectedModel!,
          });
          this.analyticsService
            .trackEvent('inference_generated', {
              model: this.selectedModel || 'unknown',
              duration: response.data.duration || 0,
              tokens: response.data.tokens || response.data.tokensUsed || 0,
            })
            .subscribe({
              error: (err: ApiError | HttpErrorResponse): void =>
                console.error('Analytics error:', err),
            });
          this.loading = false;
        },
        error: (err: ApiError | HttpErrorResponse): void => {
          this.loading = false;
          this.error = err instanceof ApiError ? err.message : 'Failed to generate response';
          console.error(err);
        },
      });
  }

  logout(): void {
    this.authService.logout();
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Simple spell check suggestions for common words
  private commonMisspellings: { [key: string]: string[] } = {
    'teh': ['the'],
    'recieve': ['receive'],
    'occured': ['occurred'],
    'seperate': ['separate'],
    'bussiness': ['business'],
    'definately': ['definitely'],
    'goverment': ['government'],
    'enviroment': ['environment'],
  };

  checkSpelling(text: string): { word: string; suggestions: string[] } | null {
    const words: string[] = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      // Remove punctuation for checking
      const cleanWord: string = word.replace(/[.,!?;:]/g, '');
      if (this.commonMisspellings[cleanWord]) {
        return {
          word: cleanWord,
          suggestions: this.commonMisspellings[cleanWord],
        };
      }
    }
    return null;
  }
}
