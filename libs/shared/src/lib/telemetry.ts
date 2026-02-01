export type PipelineStage = 'frontToApi' | 'apiToGo' | 'goToLlm';
export type PipelineStageState = 'idle' | 'processing' | 'success' | 'error';

export interface PipelineStageUpdate {
  stage: PipelineStage;
  state: PipelineStageState;
  latencyMs: number | null;
  updatedAt: string;
}

export const PIPELINE_STAGE_ORDER: PipelineStage[] = ['frontToApi', 'apiToGo', 'goToLlm'];
