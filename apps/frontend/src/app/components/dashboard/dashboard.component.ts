/// <reference types="node" />
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { InferenceService } from '../../services/inference.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../services/auth.service';
import {
  ApiError,
  InferenceModelsResponse,
  InferenceGenerateResponse,
} from '../../types/api.dto';
import { SongLengthDialogComponent } from '../song-length-dialog/song-length-dialog.component';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  isSong?: boolean;
  title?: string;
  genre?: string;
  lyrics?: string;
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
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild(SongLengthDialogComponent)
  songLengthDialog!: SongLengthDialogComponent;

  selectedModel: string | null = null;
  availableModels: Model[] = [];
  messages: Message[] = [];
  userPrompt: string = '';
  loading: boolean = false;
  error: string = '';
  estimatedTime: number = 0; // Estimated time in seconds
  elapsedTime: number = 0; // Elapsed time in seconds
  private elapsedInterval: NodeJS.Timeout | null = null;
  private pendingSongPrompt: string = ''; // Store prompt while waiting for song length selection
  private selectedSongLength: number | null = null; // Selected song length in seconds

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
      next: (response: {
        data: InferenceModelsResponse;
        timestamp: number;
        status: number;
      }): void => {
        console.log('Dashboard: Models loaded:', response.data.models);
        this.availableModels = response.data.models;
        if (this.availableModels.length > 0) {
          const defaultModel: string = this.availableModels[0].id;
          const hasExisting: boolean = this.selectedModel
            ? this.availableModels.some(
                (model: Model) => model.id === this.selectedModel,
              )
            : false;
          if (!hasExisting) {
            this.selectedModel = defaultModel;
            console.log(
              'Dashboard: Selected default model:',
              this.selectedModel,
            );
          }
        }
      },
      error: (err: ApiError | HttpErrorResponse): void => {
        this.error =
          err instanceof ApiError ? err.message : 'Failed to load models';
        console.error('Dashboard: Error loading models:', err);
      },
    });
  }

  selectModel(modelId: string): void {
    this.selectedModel = modelId;
    this.analyticsService
      .trackEvent('model_selected', { model: modelId })
      .subscribe({
        error: (err: ApiError | HttpErrorResponse): void =>
          console.error('Analytics error:', err),
      });
  }

  sendMessage(): void {
    if (!this.userPrompt.trim() || !this.selectedModel || this.loading) {
      return;
    }

    const userMessage: string = this.userPrompt;

    // Check if this is a song request
    if (this.isSongRequest(userMessage)) {
      // Store the prompt and show the song length dialog
      this.pendingSongPrompt = userMessage;
      this.userPrompt = ''; // Clear the input
      this.songLengthDialog.openDialog();
      return;
    }

    // Not a song request, proceed normally
    this.sendInferenceRequest(userMessage, null);
  }

  private isSongRequest(prompt: string): boolean {
    const songKeywords: string[] = [
      'write a song',
      'write song',
      'compose a song',
      'create a song',
      'generate a song',
      'write lyrics',
      'song about',
      'song in the style',
    ];
    return songKeywords.some((kw: string) => prompt.toLowerCase().includes(kw));
  }

  onSongLengthSelected(lengthSeconds: number): void {
    if (this.pendingSongPrompt) {
      this.selectedSongLength = lengthSeconds;
      this.sendInferenceRequest(this.pendingSongPrompt, lengthSeconds);
      this.pendingSongPrompt = '';
    }
  }

  onSongLengthDialogCancelled(): void {
    this.pendingSongPrompt = '';
    this.selectedSongLength = null;
  }

  private sendInferenceRequest(
    userMessage: string,
    songLengthSeconds: number | null,
  ): void {
    this.messages.push({ role: 'user', content: userMessage });
    this.cdr.detectChanges(); // Trigger change detection for user message
    this.loading = true;
    this.error = '';

    // Will be set by server response
    this.estimatedTime = 0;
    this.elapsedTime = 0;

    // Start elapsed time counter
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
    }
    this.elapsedInterval = setInterval(() => {
      this.elapsedTime += 0.1;
      this.cdr.markForCheck();
    }, 100);

    const requestBody: {
      modelId: string;
      prompt: string;
      songLengthSeconds?: number;
    } = {
      modelId: this.selectedModel!,
      prompt: userMessage,
    };

    if (songLengthSeconds !== null) {
      requestBody.songLengthSeconds = songLengthSeconds;
    }

    this.inferenceService.generateInference(requestBody).subscribe({
      next: (response: {
        data: InferenceGenerateResponse;
        timestamp: number;
        status: number;
      }): void => {
        console.log('[Dashboard] Full response:', response);
        console.log('[Dashboard] Response type:', typeof response);
        console.log('[Dashboard] Response.data type:', typeof response.data);

        // Extract text from response.data
        let assistantText: string = '';
        const responseData: InferenceGenerateResponse = response.data || {};

        // Set estimated time from server
        if (responseData.estimatedTime) {
          this.estimatedTime = responseData.estimatedTime;
        }

        // Try text field first
        if (responseData.text) {
          assistantText = responseData.text;
          console.log('[Dashboard] Found text in response.data.text');
        }
        // Try result field as fallback
        else if (responseData.result) {
          assistantText = responseData.result;
          console.log('[Dashboard] Found text in response.data.result');
        }

        console.log(
          '[Dashboard] Extracted text:',
          assistantText.substring(0, 50) + '...',
        );
        console.log('[Dashboard] Text is empty?', !assistantText);

        if (assistantText) {
          const assistantMessage: Message = {
            role: 'assistant',
            content: assistantText,
            model: this.selectedModel!,
            isSong: responseData.isSong,
            title: responseData.title,
            genre: responseData.genre,
            lyrics: responseData.lyrics,
          };
          this.messages.push(assistantMessage);
          this.cdr.detectChanges(); // Trigger change detection for UI update
          console.log(
            '[Dashboard] Message pushed. Total messages:',
            this.messages.length,
          );
          if (responseData.isSong) {
            console.log(
              `[Dashboard] Song generated: "${responseData.title}" (${responseData.genre})`,
            );
          }
          console.log(
            `[Dashboard] Response time: ${this.elapsedTime.toFixed(2)}s (estimated: ${this.estimatedTime}s)`,
          );
        } else {
          console.error(
            '[Dashboard] ERROR: No text extracted! Response object:',
            response,
          );
        }

        this.analyticsService
          .trackEvent('inference_generated', {
            model: this.selectedModel || 'unknown',
            duration: responseData.duration
              ? typeof responseData.duration === 'number'
                ? responseData.duration
                : parseInt(String(responseData.duration), 10) || 0
              : 0,
            tokens: responseData.tokens || responseData.tokensUsed || 0,
          })
          .subscribe({
            error: (err: ApiError | HttpErrorResponse): void =>
              console.error('Analytics error:', err),
          });

        // Stop elapsed time timer
        if (this.elapsedInterval) {
          clearInterval(this.elapsedInterval);
          this.elapsedInterval = null;
        }

        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err: ApiError | HttpErrorResponse): void => {
        // Stop elapsed time timer
        if (this.elapsedInterval) {
          clearInterval(this.elapsedInterval);
          this.elapsedInterval = null;
        }

        this.loading = false;
        this.error =
          err instanceof ApiError ? err.message : 'Failed to generate response';
        this.cdr.markForCheck();
        console.error('[Dashboard] Error in subscription:', err);
      },
    });
  }

  logout(): void {
    // Clean up interval on logout
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
      this.elapsedInterval = null;
    }
    this.authService.logout();
  }

  ngOnDestroy(): void {
    // Clean up interval when component is destroyed
    if (this.elapsedInterval) {
      clearInterval(this.elapsedInterval);
      this.elapsedInterval = null;
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage();
    }
  }

  // Simple spell check suggestions for common words
  private commonMisspellings: { [key: string]: string[] } = {
    teh: ['the'],
    recieve: ['receive'],
    occured: ['occurred'],
    seperate: ['separate'],
    bussiness: ['business'],
    definately: ['definitely'],
    goverment: ['government'],
    enviroment: ['environment'],
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
