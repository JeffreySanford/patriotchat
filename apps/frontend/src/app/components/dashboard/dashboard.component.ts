import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <div class="header">
        <h1>PatriotChat Dashboard</h1>
        <button (click)="logout()" class="btn-logout">Logout</button>
      </div>

      <div class="main-content">
        <div class="sidebar">
          <div class="model-selector">
            <h3>Select Model</h3>
            <div class="model-buttons">
              <button
                *ngFor="let model of availableModels"
                [class.active]="selectedModel === model"
                (click)="selectModel(model)"
                class="model-btn"
              >
                {{ model }}
              </button>
            </div>
          </div>
        </div>

        <div class="chat-panel">
          <div class="messages" #messagesContainer>
            <div *ngFor="let msg of messages" [class.user]="msg.role === 'user'" class="message">
              <div class="message-content">
                {{ msg.content }}
              </div>
              <div *ngIf="msg.model" class="message-meta">{{ msg.model }}</div>
            </div>
            <div *ngIf="loading" class="message assistant">
              <div class="loading-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div class="input-area">
            <textarea
              [(ngModel)]="userPrompt"
              (keydown)="handleKeydown($event)"
              placeholder="Ask something about politics, funding, or policies... (Ctrl+Enter to send)"
              class="prompt-input"
              [disabled]="!selectedModel || loading"
            ></textarea>
            <button
              (click)="sendMessage()"
              [disabled]="!selectedModel || !userPrompt.trim() || loading"
              class="btn-send"
            >
              Send
            </button>
            <p *ngIf="error" class="error-message">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #f5f5f5;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      background: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header h1 {
      margin: 0;
      color: #667eea;
    }

    .btn-logout {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-logout:hover {
      background: #c0392b;
    }

    .main-content {
      display: flex;
      flex: 1;
      gap: 20px;
      padding: 20px;
      overflow: hidden;
    }

    .sidebar {
      width: 200px;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .model-selector h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 16px;
    }

    .model-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .model-btn {
      padding: 10px;
      background: #f0f0f0;
      border: 2px solid transparent;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }

    .model-btn:hover {
      background: #e8e8e8;
    }

    .model-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
    }

    .chat-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .message {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .message.user {
      align-items: flex-end;
    }

    .message-content {
      max-width: 70%;
      padding: 12px 16px;
      border-radius: 8px;
      line-height: 1.5;
    }

    .message.user .message-content {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-bottom-right-radius: 2px;
    }

    .message.assistant .message-content {
      background: #f0f0f0;
      color: #333;
      border-bottom-left-radius: 2px;
    }

    .message-meta {
      font-size: 12px;
      color: #999;
      padding: 0 4px;
    }

    .loading-indicator {
      display: flex;
      gap: 5px;
    }

    .loading-indicator span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #667eea;
      animation: pulse 1.5s infinite;
    }

    .loading-indicator span:nth-child(2) {
      animation-delay: 0.3s;
    }

    .loading-indicator span:nth-child(3) {
      animation-delay: 0.6s;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }

    .input-area {
      padding: 20px;
      border-top: 1px solid #eee;
    }

    .prompt-input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-size: 14px;
      font-family: inherit;
      resize: none;
      height: 80px;
      margin-bottom: 10px;
    }

    .prompt-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .prompt-input:disabled {
      background: #f5f5f5;
      cursor: not-allowed;
    }

    .btn-send {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-send:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }

    .btn-send:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .error-message {
      color: #e74c3c;
      font-size: 12px;
      margin-top: 10px;
    }
  `],
})
export class DashboardComponent implements OnInit {
  selectedModel: string | null = null;
  availableModels: string[] = [];
  messages: Message[] = [];
  userPrompt = '';
  loading = false;
  error = '';

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
      next: (response) => {
        this.availableModels = response.models;
        if (this.availableModels.length > 0) {
          this.selectedModel = this.availableModels[0];
        }
      },
      error: (err) => {
        this.error = 'Failed to load models';
        console.error(err);
      },
    });
  }

  selectModel(model: string): void {
    this.selectedModel = model;
    this.analyticsService.trackEvent('model_selected', { model }).subscribe({
      error: (err) => console.error('Analytics error:', err),
    });
  }

  sendMessage(): void {
    if (!this.userPrompt.trim() || !this.selectedModel || this.loading) {
      return;
    }

    const userMessage = this.userPrompt;
    this.messages.push({ role: 'user', content: userMessage });
    this.userPrompt = '';
    this.loading = true;
    this.error = '';

    this.llmService.generateInference(userMessage, this.selectedModel).subscribe({
      next: (response) => {
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
            error: (err) => console.error('Analytics error:', err),
          });
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error || 'Failed to generate inference';
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
