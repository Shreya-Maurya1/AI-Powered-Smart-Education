/**
 * OpenAI Provider Configuration — AdaptiveMind AI Service
 * Phase 1: Config interface only. Active in Phase 2+.
 *
 * OpenAI provides high-quality completions and embeddings.
 * Use cases: assessment generation, detailed explanations, embeddings for search.
 *
 * Docs: https://platform.openai.com/docs
 */

export interface OpenAIConfig {
  apiKey: string;
  organizationId?: string;
  baseUrl: string;
  defaultModel: OpenAIChatModel;
  embeddingModel: OpenAIEmbeddingModel;
  maxTokens: number;
  temperature: number;
  streamingEnabled: boolean;
}

export type OpenAIChatModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo';

export type OpenAIEmbeddingModel =
  | 'text-embedding-3-large'
  | 'text-embedding-3-small'
  | 'text-embedding-ada-002';

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface OpenAIRequestPayload {
  model: OpenAIChatModel;
  messages: OpenAIMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  response_format?: { type: 'text' | 'json_object' };
  tools?: OpenAITool[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
}

export interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>; // JSON Schema
  };
}

export interface OpenAIEmbeddingRequest {
  model: OpenAIEmbeddingModel;
  input: string | string[];
  dimensions?: number;
}

export interface OpenAIEmbeddingResponse {
  object: 'list';
  data: Array<{
    object: 'embedding';
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: { prompt_tokens: number; total_tokens: number };
}

/**
 * Default OpenAI configuration for AdaptiveMind.
 * Load OPENAI_API_KEY from environment in Phase 2.
 */
export const defaultOpenAIConfig: Omit<OpenAIConfig, 'apiKey'> = {
  baseUrl: 'https://api.openai.com/v1',
  defaultModel: 'gpt-4o-mini',
  embeddingModel: 'text-embedding-3-small',
  maxTokens: 4096,
  temperature: 0.7,
  streamingEnabled: true,
};

/**
 * Use cases for OpenAI in AdaptiveMind (Phase 2+):
 * - Assessment question generation (structured JSON output)
 * - Detailed lesson explanations (tool calling for content lookup)
 * - Student feedback generation after assessment
 * - Embedding generation for semantic search across lessons
 * - Knowledge graph entity extraction
 */
