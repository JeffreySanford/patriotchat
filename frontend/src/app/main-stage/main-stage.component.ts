import { Component, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { LlmQueryService, QueryResponse } from '../services/llm-query.service';
import { PipelineTelemetryService } from '../services/pipeline-telemetry.service';
import { PipelineStageUpdate } from '@patriotchat/shared';

interface StageBadge {
  label: string;
  detail: string;
}

interface StageInsight {
  title: string;
  detail: string;
  accent: string;
}

@Component({
  selector: 'app-main-stage',
  templateUrl: './main-stage.component.html',
  styleUrls: ['./main-stage.component.scss'],
  standalone: false,
})
export class MainStageComponent implements OnDestroy {
  readonly badges: StageBadge[] = [
    { label: 'Pipeline health', detail: 'Realtime telemetry shows 98% success rate' },
    { label: 'Prompt queue', detail: 'Three messages are buffered for the current session' },
    { label: 'Assistant readiness', detail: 'Editor automation verified for inline edits' },
  ];

  readonly insights: StageInsight[] = [
    {
      title: 'Surface harmony',
      detail: 'Token usage, safety policy, and guardrail status are collected per request.',
      accent: '#a855f7',
    },
    {
      title: 'Guest guidance',
      detail: 'We log suggestions, acceptance reasons, and fallback actions for every change.',
      accent: '#f97316',
    },
    {
      title: 'Confidence pulse',
      detail: 'Editor status, write permissions, and debug logs stay within reach.',
      accent: '#10b981',
    },
  ];

  private readonly fb: FormBuilder = inject(FormBuilder) as FormBuilder;
  private readonly llm: LlmQueryService = inject(LlmQueryService) as LlmQueryService;
  private readonly telemetryService: PipelineTelemetryService =
    inject(PipelineTelemetryService) as PipelineTelemetryService;

  readonly queryForm: FormGroup = this.fb.group({
    query: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(3)],
    }),
  });

  private get queryControl(): FormControl<string> {
    return this.queryForm.controls['query'] as FormControl<string>;
  }

  loading: boolean = false;
  response: string | null = null;
  latencyMs: number | null = null;
  error: string | null = null;
  loadingElapsedSeconds: number = 0;
  readonly estimatedDurationSeconds: number = 25;
  private loadingTimer?: ReturnType<typeof window.setInterval>;

  readonly telemetryStages$: Observable<PipelineStageUpdate[]> =
    this.telemetryService.stageUpdates$;

  readonly stageLabels: Record<string, string> = {
    frontToApi: 'Frontend → API',
    apiToGo: 'API → Heavy',
    goToLlm: 'Heavy → LLM',
  };

  submitQuery(): void {
    if (this.queryForm.invalid) {
      this.queryForm.markAllAsTouched();
      return;
    }

    const prompt: string = this.queryControl.value.trim();
    if (!prompt) {
      this.queryForm.setErrors({ required: true });
      return;
    }

    this.loading = true;
    this.response = null;
    this.latencyMs = null;
    this.error = null;
    this.startTimer();

    this.llm
      .query(prompt)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.stopTimer();
        }),
      )
      .subscribe({
        next: (payload: QueryResponse) => {
          this.response = payload.response;
          this.latencyMs = payload.latencyMs ?? null;
        },
        error: (err: Error | string | null | undefined) => {
          this.error = `LLM request failed: ${this.extractErrorMessage(err)}`;
        },
      });
  }

  get remainingSeconds(): number {
    return Math.max(this.estimatedDurationSeconds - this.loadingElapsedSeconds, 0);
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.loadingElapsedSeconds = 0;
    this.loadingTimer = window.setInterval(() => {
      this.loadingElapsedSeconds += 1;
    }, 1000);
  }

  private stopTimer(): void {
    if (this.loadingTimer) {
      window.clearInterval(this.loadingTimer);
      this.loadingTimer = undefined;
    }
  }

  private extractErrorMessage(error: Error | string | null | undefined): string {
    if (!error) {
      return 'unknown error';
    }
    if (typeof error === 'string') {
      return error;
    }
    return error.message ?? 'unknown error';
  }
}
