import { describe, it, beforeEach, expect, vi } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { LlmService } from '../../services/llm.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let llmService: LlmService;
  let analyticsService: AnalyticsService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [FormsModule, HttpClientTestingModule, CommonModule],
      providers: [LlmService, AnalyticsService, AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    llmService = TestBed.inject(LlmService);
    analyticsService = TestBed.inject(AnalyticsService);
    authService = TestBed.inject(AuthService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty messages and null model', () => {
    expect(component.messages).toEqual([]);
    expect(component.selectedModel).toBeNull();
    expect(component.userPrompt).toBe('');
    expect(component.loading).toBeFalsy();
  });

  it('should load models on init', () => {
    vi.spyOn(llmService, 'getModels').mockReturnValue(
      of({ models: ['model1', 'model2', 'model3'] }),
    );

    component.ngOnInit();

    expect(llmService.getModels).toHaveBeenCalled();
    expect(component.availableModels).toEqual(['model1', 'model2', 'model3']);
  });

  it('should send message and generate inference', async () => {
    component.selectedModel = 'test-model';
    component.userPrompt = 'Hello, what is 2+2?';

    vi.spyOn(llmService, 'generateInference').mockReturnValue(
      of({
        result: 'The answer is 4.',
        model: 'test-model',
        tokens: 42,
        duration: '1.2s',
      }),
    );
    vi.spyOn(analyticsService, 'trackEvent').mockReturnValue(
      of({ success: true }),
    );

    component.sendMessage();

    expect(component.loading).toBeTruthy();
    expect(llmService.generateInference).toHaveBeenCalledWith(
      'Hello, what is 2+2?',
      'test-model',
      undefined,
    );

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(component.loading).toBeFalsy();
    expect(component.messages.length).toBe(2);
    expect(component.messages[0].role).toBe('user');
    expect(component.messages[1].role).toBe('assistant');
    expect(component.userPrompt).toBe('');
  });

  it('should handle inference errors gracefully', async () => {
    component.selectedModel = 'test-model';
    component.userPrompt = 'Test prompt';

    vi.spyOn(llmService, 'generateInference').mockReturnValue(
      throwError(() => new Error('API error')),
    );

    component.sendMessage();

    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(component.loading).toBeFalsy();
    expect(component.error).toBeTruthy();
  });

  it('should not send message if model is not selected', () => {
    component.selectedModel = null;
    component.userPrompt = 'Test';

    const spy = vi.spyOn(llmService, 'generateInference');

    component.sendMessage();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should logout successfully', () => {
    vi.spyOn(authService, 'logout');

    component.logout();

    expect(authService.logout).toHaveBeenCalled();
  });
});
