/**
 * LLM Provider Index — AdaptiveMind AI Service
 * Phase 1: Config only. Active orchestration begins in Phase 2+.
 */

export * from './groq.config';
export * from './openai.config';
export * from './ollama.config';
export * from './gemini.config';

/**
 * Provider selection strategy for AdaptiveMind (Phase 2+):
 *
 * Priority order (can be overridden per use case):
 * 1. Groq     — real-time responses (hints, quick Q&A)
 * 2. Gemini Flash — balanced speed/quality
 * 3. OpenAI   — highest quality generation
 * 4. Gemma 3 27B — open-weights, fine-tunable
 * 5. Ollama   — offline/privacy fallback
 */

export type LLMProvider = 'groq' | 'openai' | 'ollama' | 'gemini' | 'gemma';

export interface LLMProviderConfig {
  provider: LLMProvider;
  enabled: boolean;
  priority: number;        // lower = higher priority
  useCases: string[];
}

export const providerRegistry: LLMProviderConfig[] = [
  {
    provider: 'groq',
    enabled: true,
    priority: 1,
    useCases: ['hints', 'quick-qa', 'streaming-chat'],
  },
  {
    provider: 'gemini',
    enabled: true,
    priority: 2,
    useCases: ['multimodal', 'long-context', 'lesson-analysis'],
  },
  {
    provider: 'openai',
    enabled: true,
    priority: 3,
    useCases: ['assessment-generation', 'embeddings', 'tool-calling'],
  },
  {
    provider: 'gemma',
    enabled: true,
    priority: 4,
    useCases: ['curriculum-specific', 'fine-tuned', 'privacy-cloud'],
  },
  {
    provider: 'ollama',
    enabled: false,          // enable for offline deployments
    priority: 5,
    useCases: ['offline', 'privacy-local', 'cost-free'],
  },
];
