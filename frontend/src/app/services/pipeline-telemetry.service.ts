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
    const endpoint: string = 'http://localhost:3000';
    const socketNamespace: string = '/telemetry';
    const socketPath: string = '/socket.io';
    console.log('[PipelineTelemetryService] 🔌 Initiating socket.io connection');
    console.log('[PipelineTelemetryService] - Endpoint:', endpoint);
    console.log('[PipelineTelemetryService] - Namespace:', socketNamespace);
    console.log('[PipelineTelemetryService] - Socket path:', socketPath);
    console.log('[PipelineTelemetryService] - Transport: websocket');
    console.log('[PipelineTelemetryService] - Reconnection delay: 2500ms');
    
    this.socket = io(`${endpoint}${socketNamespace}`, {
      path: socketPath,
      transports: ['websocket'],
      reconnectionDelay: 2_500,
      reconnectionAttempts: Infinity,
    });
    console.log('[PipelineTelemetryService] ⏳ Socket.io client created, waiting for connection...');

    this.socket.on('connect', () => {
      console.log('[PipelineTelemetryService] ✅ Socket.io connected successfully');
      console.log('[PipelineTelemetryService] - Socket ID:', this.socket?.id);
      console.log('[PipelineTelemetryService] - Connected to namespace: /telemetry');
    });

    this.socket.on('connecting', () => {
      console.log('[PipelineTelemetryService] ⏳ Socket.io attempting connection...');
    });

    this.socket.on('disconnect', (reason: string) => {
      console.warn('[PipelineTelemetryService] ⚠️ Socket.io disconnected');
      console.warn('[PipelineTelemetryService] - Reason:', reason);
      console.warn('[PipelineTelemetryService] - Will attempt to reconnect in 2500ms');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('[PipelineTelemetryService] ❌ Socket.io connection error');
      console.error('[PipelineTelemetryService] - Error:', error.message);
      console.error('[PipelineTelemetryService] - Details:', error);
    });

    this.socket.on('stage', (update: PipelineStageUpdate) => {
      console.log('[PipelineTelemetryService] 📨 Received stage update from server');
      console.log('[PipelineTelemetryService] - Stage:', update.stage);
      console.log('[PipelineTelemetryService] - State:', update.state);
      console.log('[PipelineTelemetryService] - Latency:', update.latencyMs, 'ms');
      console.log('[PipelineTelemetryService] - Updated at:', update.updatedAt);
      this.mergeStage(update);
    });

    this.socket.on('error', (error: Error): void => {
      console.error('[PipelineTelemetryService] ❌ Socket.io error event');
      console.error('[PipelineTelemetryService] - Error:', error);
    });

    this.socket.on('reconnect_attempt', (): void => {
      console.log('[PipelineTelemetryService] 🔄 Attempting to reconnect...');
    });

    this.socket.on('reconnect', (): void => {
      console.log('[PipelineTelemetryService] ✅ Reconnected after disconnect');
    });
  }

  private mergeStage(update: PipelineStageUpdate): void {
    console.log('[PipelineTelemetryService] Processing stage merge');
    console.log('[PipelineTelemetryService] - Incoming update:', {
      stage: update.stage,
      state: update.state,
      latencyMs: update.latencyMs,
    });
    
    const merged: PipelineStageUpdate[] = this.stageOrder.map((stage: PipelineStage): PipelineStageUpdate =>
      stage === update.stage ? update : this.currentStage(stage),
    );
    
    console.log('[PipelineTelemetryService] ✅ Merged stages:');
    merged.forEach((s: PipelineStageUpdate): void => {
      console.log('[PipelineTelemetryService]   -', s.stage, ':', s.state, '(latency:', s.latencyMs, 'ms)');
    });
    
    this.updatesSubject.next(merged);
  }

  private currentStage(stage: PipelineStage): PipelineStageUpdate {
    const current: PipelineStageUpdate | undefined = this.updatesSubject.value.find(
      (entry: PipelineStageUpdate): boolean => entry.stage === stage,
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
