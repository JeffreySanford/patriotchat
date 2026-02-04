/**
 * Inference API DTOs
 * Shared between backend and frontend for type safety
 */

/**
 * Response from /inference/models endpoint
 * Lists all available LLM models
 */
export interface InferenceModelsResponse {
  models: Array<{
    id: string;
    name: string;
    description?: string;
    provider?: string;
    contextWindow?: number;
  }>;
}

/**
 * Request body for /inference/generate endpoint
 * Specifies the model and prompt for generation
 */
export interface InferenceGenerateRequest {
  modelId?: string;
  model?: string; // Alias for modelId for flexibility
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  context?: string;
  songLengthSeconds?: number; // Song length preference in seconds (e.g., 76, 180, 300, 600)
}

/**
 * Response from /inference/generate endpoint
 * Contains the generated text from the LLM
 */
export interface InferenceGenerateResponse {
  modelId?: string;
  model?: string;
  prompt: string;
  text?: string;
  result?: string; // Alias for text
  tokensUsed?: number;
  tokens?: number; // Alias for tokensUsed
  duration?: number | string;
  finishReason?: 'length' | 'stop' | 'error';
  estimatedTime?: number; // Estimated time in milliseconds
  actualTime?: number; // Actual time taken in milliseconds
  // Song-specific fields
  isSong?: boolean; // Whether this is a song response
  title?: string; // Song title
  genre?: string; // Song genre
  lyrics?: string; // Song lyrics
}
