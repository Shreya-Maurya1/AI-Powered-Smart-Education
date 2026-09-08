/**
 * Ollama Provider Configuration — AdaptiveMind AI Service
 * Phase 1: Config interface only. Active in Phase 2+.
 *
 * Ollama enables local LLM inference with privacy-first approach.
 * Use cases: offline mode, privacy-sensitive schools, cost-free inference.
 *
 * Docs: https://ollama.ai/docs
 * Install: curl -fsSL https://ollama.ai/install.sh | sh
 */

export interface OllamaConfig {
  baseUrl: string;
  defaultModel: OllamaModel;
  models: OllamaModel[];
  keepAlive: string;      // e.g. '5m', '1h', '0' (unload immediately)
  numCtx: number;         // context window size
  temperature: number;
  streamingEnabled: boolean;
  options?: OllamaModelOptions;
}

export type OllamaModel =
  | 'llama3.1:8b'
  | 'llama3.1:70b'
  | 'llama3.2:3b'
  | 'gemma2:9b'
  | 'gemma2:27b'
  | 'phi3:mini'
  | 'phi3:medium'
  | 'mistral:7b'
  | 'mixtral:8x7b'
  | 'qwen2.5:7b'
  | 'deepseek-r1:7b'
  | 'deepseek-r1:14b'
  | 'nomic-embed-text'    // for embeddings
  | 'mxbai-embed-large';  // for embeddings

export interface OllamaModelOptions {
  num_ctx?: number;
  num_gpu?: number;
  main_gpu?: number;
  low_vram?: boolean;
  f16_kv?: boolean;
  vocab_only?: boolean;
  use_mmap?: boolean;
  use_mlock?: boolean;
  num_thread?: number;
  num_keep?: number;
  seed?: number;
  num_predict?: number;
  top_k?: number;
  top_p?: number;
  tfs_z?: number;
  typical_p?: number;
  repeat_last_n?: number;
  temperature?: number;
  repeat_penalty?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  mirostat?: number;
  mirostat_tau?: number;
  mirostat_eta?: number;
  penalize_newline?: boolean;
  stop?: string[];
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[]; // base64-encoded images for vision models
}

export interface OllamaChatRequest {
  model: OllamaModel | string;
  messages: OllamaMessage[];
  stream?: boolean;
  format?: 'json';
  options?: OllamaModelOptions;
  keep_alive?: string;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: OllamaMessage;
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export interface OllamaEmbeddingRequest {
  model: OllamaModel | string;
  input: string | string[];
  truncate?: boolean;
  options?: OllamaModelOptions;
  keep_alive?: string;
}

export interface OllamaEmbeddingResponse {
  model: string;
  embeddings: number[][];
  total_duration: number;
  load_duration: number;
  prompt_eval_count: number;
}

export interface OllamaModelInfo {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

/**
 * Default Ollama configuration for AdaptiveMind.
 * Assumes Ollama is running locally on default port.
 * Override OLLAMA_BASE_URL env var for remote instances.
 */
export const defaultOllamaConfig: OllamaConfig = {
  baseUrl: 'http://localhost:11434',
  defaultModel: 'llama3.1:8b',
  models: [
    'llama3.1:8b',
    'gemma2:9b',
    'phi3:mini',
    'nomic-embed-text',
  ],
  keepAlive: '5m',
  numCtx: 4096,
  temperature: 0.7,
  streamingEnabled: true,
};

/**
 * Use cases for Ollama in AdaptiveMind (Phase 2+):
 * - Schools with restricted internet access (fully offline)
 * - Privacy-sensitive institutions (no data sent to external APIs)
 * - Cost-free development and testing
 * - Embedding generation with nomic-embed-text (no API cost)
 * - Fallback provider when cloud APIs are unavailable
 */

/**
 * Quick Start for Development:
 * 1. Install Ollama: https://ollama.ai/download
 * 2. Pull models: ollama pull llama3.1:8b && ollama pull nomic-embed-text
 * 3. Start server: ollama serve
 * 4. Verify: curl http://localhost:11434/api/tags
 */
