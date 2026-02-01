import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { PipelineStage, PipelineStageUpdate, PIPELINE_STAGE_ORDER } from '@patriotchat/shared';

@Injectable({
  providedIn: 'root',
})
export class PipelineTelemetryService implements OnDestroy {
  private readonly stageOrder: PipelineStage[] = PIPELINE_STAGE_ORDER;
  private readonly updatesSubject: BehaviorSubject<PipelineStageUpdate[]>;
  readonly stageUpdates$: Observable<PipelineStageUpdate[]>;
  private socket?: Socket;

  constructor() {
    this.updatesSubject = new BehaviorSubject<PipelineStageUpdate[]>(
      this.stageOrder.map((stage: PipelineStage) => this.createInitialStage(stage)),
    );
    this.stageUpdates$ = this.updatesSubject.asObservable();
    this.connectWhenReady();
  }

  ngOnDestroy(): void {
    this.socket?.disconnect();
  }

  private connectWhenReady(): void {
    // Updated to use /telemetry namespace
    const fallbackEndpoint: string = 'http://localhost:3000/telemetry';
    const configuredEndpoint: string = fallbackEndpoint;
    this.socket = io(configuredEndpoint, {
      transports: ['websocket'],
      reconnectionDelay: 2_500,
      reconnectionAttempts: Infinity,
    });
    this.socket.on('stage', (update: PipelineStageUpdate) => this.mergeStage(update));
  }

  private mergeStage(update: PipelineStageUpdate): void {
    const merged: PipelineStageUpdate[] = this.stageOrder.map((stage: PipelineStage) =>
      stage === update.stage ? update : this.currentStage(stage),
    );
    this.updatesSubject.next(merged);
  }

  private currentStage(stage: PipelineStage): PipelineStageUpdate {
    const current: PipelineStageUpdate | undefined = this.updatesSubject.value.find(
      (entry: PipelineStageUpdate) => entry.stage === stage,
    );
    if (current) {
      return current;
    }
    return this.createInitialStage(stage);
  }

  private createInitialStage(stage: PipelineStage): PipelineStageUpdate {
    return {
      stage,
      state: 'idle',
      latencyMs: null,
      updatedAt: new Date().toISOString(),
    };
  }
}
