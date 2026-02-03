import { Component, OnInit } from '@angular/core';
import { LlmService } from '../../services/llm.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: false
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
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadModels();
  }

  loadModels(): void {
    this.llmService.getModels().subscribe({
      next: (response: { models: string[] }): void => {
        this.availableModels = response.models;
        if (this.availableModels.length > 0) {
          this.selectedModel = this.availableModels[0];
        }
      },
      error: (err: unknown): void => {
        this.error = 'Failed to load models';
        console.error(err);
      },
    });
  }

  selectModel(model: string): void {
    this.selectedModel = model;
    this.analyticsService.trackEvent('model_selected', { model }).subscribe({
      error: (err: unknown): void => console.error('Analytics error:', err),
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

    this.llmService.generateInference(userMessage, this.selectedModel).subscribe({
      next: (response: { result: string; duration: number; tokens: number }): void => {
        this.messages.push({
          role: 'assistant',
          content: response.result,
          model: this.selectedModel!,
        });
        this.analyticsService
          .trackEvent('inference_generated', {
            model: this.selectedModel,
            duration: response.duration,
            tokens: response.tokens,
          })
          .subscribe({
            error: (err: unknown): void => console.error('Analytics error:', err),
          });
        this.loading = false;
      },
      error: (err: unknown): void => {
        this.loading = false;
        const errorMsg = (err as Record<string, unknown>)?.error?.error || 'Failed to generate inference';
        this.error = typeof errorMsg === 'string' ? errorMsg : 'Failed to generate inference';
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
}

