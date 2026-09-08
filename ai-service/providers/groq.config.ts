/**
 * Groq Provider Configuration — AdaptiveMind AI Service
 * Phase 1: Config interface only. Active in Phase 2+.
 *
 * Groq provides ultra-fast inference for open-source models.
 * Use cases: real-time hints, quick explanations, streaming responses.
 *
 * Docs: https://console.groq.com/docs
 */

export interface GroqConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: GroqModel;
  models: GroqModel[];
  maxTokens: number;
  temperature: number;
  streamingEnabled: boolean;
}

export type GroqModel =
  | 'llama-3.1-70b-versatile'
  | 'llama-3.1-8b-instant'
  | 'llama3-groq-70b-8192-tool-use-preview'
  | 'mixtral-8x7b-32768'
  | 'gemma2-9b-it'
  | 'gemma-7b-it';

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqRequestPayload {
  model: GroqModel;
  messages: GroqMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  stop?: string[];
}

export interface GroqCompletionResponse {
  id: string;
  object: 'chat.completion';
  created: number;
  model: GroqModel;
  choices: Array<{
    index: number;
    message: { role: 'assistant'; content: string };
    finish_reason: 'stop' | 'length' | 'tool_calls';
    logprobs: null;
  }>;
  usage: {
    queue_time: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_time: number;
    completion_time: number;
    total_time: number;
  };
  x_groq: { id: string };
}

/**
 * Default Groq configuration for AdaptiveMind.
 * Load GROQ_API_KEY from environment in Phase 2.
 */
export const defaultGroqConfig: Omit<GroqConfig, 'apiKey'> = {
  baseUrl: 'https://api.groq.com/openai/v1',
  defaultModel: 'llama-3.1-70b-versatile',
  models: [
    'llama-3.1-70b-versatile',
    'llama-3.1-8b-instant',
    'mixtral-8x7b-32768',
    'gemma2-9b-it',
  ],
  maxTokens: 2048,
  temperature: 0.7,
  streamingEnabled: true,
};

/**
 * Use cases for Groq in AdaptiveMind (Phase 2+):
 * - Real-time "Hint" button during assessment (low latency required)
 * - Streaming explanations for lesson content
 * - Quick topic summaries
 * - Concept definition lookup
 */
