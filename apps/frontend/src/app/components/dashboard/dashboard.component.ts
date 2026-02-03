import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LlmService } from '../../services/llm.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { getErrorMessage } from '../../models/api-error.model';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

interface InferenceResponse {
  result: string;
  duration: string | number;
  tokens: string | number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false,
})
export class DashboardComponent implements OnInit {
  selectedModel: string | null = null;
  availableModels: string[] = [];
  messages: Message[] = [];
  userPrompt: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private llmService: LlmService,
    private analyticsService: AnalyticsService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.llmService.getModels().subscribe({
      next: (response: { models: string[] }): void => {
        console.log('Dashboard: Models loaded:', response.models);
        this.availableModels = response.models;
        if (this.availableModels.length > 0) {
          this.selectedModel = this.availableModels[0];
          console.log('Dashboard: Selected default model:', this.selectedModel);
        }
      },
      error: (err: HttpErrorResponse): void => {
        this.error = getErrorMessage(err);
        console.error('Dashboard: Error loading models:', err);
      },
    });
  }

  selectModel(model: string): void {
    this.selectedModel = model;
    this.analyticsService.trackEvent('model_selected', { model }).subscribe({
      error: (err: HttpErrorResponse): void =>
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

    this.llmService
      .generateInference(userMessage, this.selectedModel)
      .subscribe(
        (response: InferenceResponse): void => {
          this.messages.push({
            role: 'assistant',
            content: response.result,
            model: this.selectedModel!,
          });
          this.analyticsService
            .trackEvent('inference_generated', {
              model: this.selectedModel || 'unknown',
              duration: response.duration,
              tokens: response.tokens,
            })
            .subscribe({
              error: (err: HttpErrorResponse): void =>
                console.error('Analytics error:', err),
            });
          this.loading = false;
        },
        (err: HttpErrorResponse): void => {
          this.loading = false;
          this.error = getErrorMessage(err);
          console.error(err);
        },
      );
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
    const words = text.toLowerCase().split(/\s+/);
    for (const word of words) {
      // Remove punctuation for checking
      const cleanWord = word.replace(/[.,!?;:]/g, '');
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
