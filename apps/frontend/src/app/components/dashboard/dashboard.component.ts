import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
    private cdr: ChangeDetectorRef,
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
          console.log('[Dashboard] Full response:', response);
          console.log('[Dashboard] Response type:', typeof response);
          console.log('[Dashboard] Response.data type:', typeof response.data);
          
          // Defensive extraction - try multiple paths
          let assistantText = '';
          const responseData: any = response.data;
          
          // First try: response.data.text
          if (responseData && responseData.text) {
            assistantText = responseData.text;
            console.log('[Dashboard] Found text in response.data.text');
          }
          // Second try: response.data.result  
          else if (responseData && responseData.result) {
            assistantText = responseData.result;
            console.log('[Dashboard] Found text in response.data.result');
          }
          // Third try: maybe response itself is the data
          else if (response && (response as any).text) {
            assistantText = (response as any).text;
            console.log('[Dashboard] Found text in response.text');
          } else if (response && (response as any).result) {
            assistantText = (response as any).result;
            console.log('[Dashboard] Found text in response.result');
          }
          
          console.log('[Dashboard] Extracted text:', assistantText.substring(0, 50) + '...');
          console.log('[Dashboard] Text is empty?', !assistantText);
          
          if (assistantText) {
            this.messages.push({
              role: 'assistant',
              content: assistantText,
              model: this.selectedModel!,
            });
            console.log('[Dashboard] Message pushed. Total messages:', this.messages.length);
          } else {
            console.error('[Dashboard] ERROR: No text extracted! Response object:', response);
          }
          
          this.analyticsService
            .trackEvent('inference_generated', {
              model: this.selectedModel || 'unknown',
              duration: (response.data as any).duration || 0,
              tokens: (response.data as any).tokens || 0,
            })
            .subscribe({
              error: (err: ApiError | HttpErrorResponse): void =>
                console.error('Analytics error:', err),
            });
          this.loading = false;
          this.cdr.markForCheck();
        },
        error: (err: ApiError | HttpErrorResponse): void => {
          this.loading = false;
          this.error = err instanceof ApiError ? err.message : 'Failed to generate response';
          this.cdr.markForCheck();
          console.error('[Dashboard] Error in subscription:', err);
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
