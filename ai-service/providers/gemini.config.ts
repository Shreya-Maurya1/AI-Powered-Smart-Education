/**
 * Google Gemini / Gemma Provider Configuration — AdaptiveMind AI Service
 * Phase 1: Config interface only. Active in Phase 2+.
 *
 * Covers two Google AI offerings:
 *   1. Gemini API (Google AI Studio / Vertex AI) — cloud-hosted Gemini models
 *   2. Gemma models — open-weights models (including Gemma 3 27B via cloud)
 *
 * Docs:
 *   - Google AI Studio: https://aistudio.google.com
 *   - Vertex AI: https://cloud.google.com/vertex-ai/generative-ai/docs
 *   - Gemma: https://ai.google.dev/gemma
 */

// ============================================================
// GEMINI API (Google AI Studio)
// ============================================================

export interface GeminiConfig {
  apiKey: string;
  baseUrl: string;
  defaultModel: GeminiModel;
  embeddingModel: GeminiEmbeddingModel;
  maxOutputTokens: number;
  temperature: number;
  topP: number;
  topK: number;
  streamingEnabled: boolean;
}

export type GeminiModel =
  | 'gemini-1.5-pro-latest'
  | 'gemini-1.5-flash-latest'
  | 'gemini-1.5-flash-8b-latest'
  | 'gemini-2.0-flash-exp'
  | 'gemini-2.5-pro-preview'
  | 'gemma-3-27b-it'       // Gemma 3 27B Instruction Tuned (via AI Studio)
  | 'gemma-3-9b-it'
  | 'gemma-3-4b-it';

export type GeminiEmbeddingModel =
  | 'text-embedding-004'
  | 'embedding-001';

export interface GeminiContent {
  role: 'user' | 'model';
  parts: Array<GeminiPart>;
}

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } }   // base64 images
  | { fileData: { mimeType: string; fileUri: string } };  // uploaded files

export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  responseMimeType?: 'text/plain' | 'application/json';
  responseSchema?: Record<string, unknown>; // JSON Schema for structured output
  candidateCount?: number;
  stopSequences?: string[];
}

export interface GeminiSafetySettings {
  category:
    | 'HARM_CATEGORY_HARASSMENT'
    | 'HARM_CATEGORY_HATE_SPEECH'
    | 'HARM_CATEGORY_SEXUALLY_EXPLICIT'
    | 'HARM_CATEGORY_DANGEROUS_CONTENT';
  threshold:
    | 'BLOCK_NONE'
    | 'BLOCK_ONLY_HIGH'
    | 'BLOCK_MEDIUM_AND_ABOVE'
    | 'BLOCK_LOW_AND_ABOVE';
}

export interface GeminiRequestPayload {
  contents: GeminiContent[];
  systemInstruction?: { parts: Array<{ text: string }> };
  generationConfig?: GeminiGenerationConfig;
  safetySettings?: GeminiSafetySettings[];
  tools?: GeminiTool[];
}

export interface GeminiTool {
  functionDeclarations?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>; // JSON Schema
  }>;
  googleSearchRetrieval?: Record<string, unknown>;
}

export interface GeminiResponse {
  candidates: Array<{
    content: GeminiContent;
    finishReason: 'STOP' | 'MAX_TOKENS' | 'SAFETY' | 'RECITATION' | 'OTHER';
    index: number;
    safetyRatings: Array<{ category: string; probability: string }>;
  }>;
  usageMetadata: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  modelVersion: string;
}

// ============================================================
// GEMMA 3 27B — Vertex AI (Cloud, Production)
// ============================================================

export interface GemmaVertexConfig {
  projectId: string;
  location: string;
  modelId: GemmaVertexModel;
  endpointId?: string;    // custom endpoint if deployed separately
  maxOutputTokens: number;
  temperature: number;
  streamingEnabled: boolean;
}

export type GemmaVertexModel =
  | 'google/gemma-3-27b-it'     // Gemma 3 27B Instruction Tuned
  | 'google/gemma-3-9b-it'
  | 'google/gemma-3-4b-it'
  | 'google/gemma-3-1b-it';

/**
 * Default Gemini configuration (Google AI Studio).
 * Load GEMINI_API_KEY from environment in Phase 2.
 */
export const defaultGeminiConfig: Omit<GeminiConfig, 'apiKey'> = {
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  defaultModel: 'gemini-1.5-flash-latest',
  embeddingModel: 'text-embedding-004',
  maxOutputTokens: 8192,
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  streamingEnabled: true,
};

/**
 * Gemma 3 27B via Vertex AI — for production deployments.
 * Requires GCP project with Vertex AI enabled.
 * Load GOOGLE_CLOUD_PROJECT from environment in Phase 2.
 */
export const defaultGemmaVertexConfig: Omit<GemmaVertexConfig, 'projectId'> = {
  location: 'us-central1',
  modelId: 'google/gemma-3-27b-it',
  maxOutputTokens: 8192,
  temperature: 0.7,
  streamingEnabled: true,
};

/**
 * Use cases for Gemini/Gemma in AdaptiveMind (Phase 2+):
 *
 * Gemini 1.5 Pro:
 * - Multimodal lesson analysis (images, diagrams, videos)
 * - Long-context document understanding (e.g., full textbook chapters)
 * - Complex code explanation and debugging
 *
 * Gemini 1.5 Flash:
 * - Fast, cost-efficient completions for daily student interactions
 * - Batch processing of assessment feedback
 * - Topic summaries and key point extraction
 *
 * Gemma 3 27B (Cloud via Vertex AI):
 * - Privacy-focused alternative to proprietary models
 * - Custom fine-tuning on Indian curriculum content (Phase 4+)
 * - NCERT/CBSE specific knowledge base
 * - Competitive inference cost vs GPT-4o
 *
 * Gemma 3 27B via Ollama (local):
 * - High-quality offline inference for resource-rich schools
 * - Zero API cost for offline-first deployments
 * - Same weights as cloud version
 */
