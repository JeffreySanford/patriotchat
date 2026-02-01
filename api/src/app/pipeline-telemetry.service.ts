import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { PipelineStage, PipelineStageState, PipelineStageUpdate, PIPELINE_STAGE_ORDER } from '@patriotchat/shared';

@Injectable()
export class PipelineTelemetryService {
  private readonly stageMap: Map<PipelineStage, PipelineStageUpdate>;
  private readonly updatesSubject: BehaviorSubject<PipelineStageUpdate[]>;

  constructor() {
    this.stageMap = new Map<PipelineStage, PipelineStageUpdate>();
    PIPELINE_STAGE_ORDER.forEach((stage: PipelineStage) => {
      this.stageMap.set(stage, this.createInitialStage(stage));
    });
    this.updatesSubject = new BehaviorSubject<PipelineStageUpdate[]>(this.getOrderedStages());
  }

  get updates$(): Observable<PipelineStageUpdate[]> {
    return this.updatesSubject.asObservable();
  }

  recordStage(stage: PipelineStage, state: PipelineStageState, latencyMs: number | null = null): void {
    const update: PipelineStageUpdate = {
      stage,
      state,
      latencyMs,
      updatedAt: new Date().toISOString(),
    };
    this.stageMap.set(stage, update);
    this.updatesSubject.next(this.getOrderedStages());
  }

  getLatest(): PipelineStageUpdate[] {
    return this.getOrderedStages();
  }

  private getOrderedStages(): PipelineStageUpdate[] {
    return PIPELINE_STAGE_ORDER.map((stage: PipelineStage) => {
      const existing: PipelineStageUpdate | undefined = this.stageMap.get(stage);
      if (existing) {
        return existing;
      }
      const fresh: PipelineStageUpdate = this.createInitialStage(stage);
      this.stageMap.set(stage, fresh);
      return fresh;
    });
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
