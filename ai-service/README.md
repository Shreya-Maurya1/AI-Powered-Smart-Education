# AI Service — AdaptiveMind

> **Phase 1 Note**: This directory is a placeholder. No AI logic is active in Phase 1.
> AI/agent functionality begins in **Phase 2**.

## Overview

The `ai-service` will house all intelligent components of AdaptiveMind:
- **Adaptive Learning Engine** — recommends next lessons/topics based on performance
- **Knowledge Graph** — tracks concept mastery across subjects
- **Memory System** — persistent student learning memory across sessions
- **Assessment Intelligence** — auto-generates and grades assessments
- **LLM Orchestration** — multi-provider LLM support for explanations, hints, feedback

## LLM Providers (Configured in Phase 2+)

| Provider | Model | Use Case |
|---|---|---|
| **Groq** | Llama 3.1 70B / Mixtral 8x7B | Fast inference, real-time hints |
| **OpenAI** | GPT-4o / GPT-4o-mini | High-quality explanations, assessment generation |
| **Ollama** | Local models (Llama, Phi, Gemma) | Privacy-first, offline mode |
| **Google Gemini** | Gemma 3 (27B) / Gemini 1.5 Pro | Multimodal content, code explanations |

## Provider Configs

See `providers/` directory for typed configuration interfaces for each provider.

## Phase Roadmap

- **Phase 1** ✅ — Core platform (no AI)
- **Phase 2** ⏳ — LLM integration, knowledge graph, basic recommendations
- **Phase 3** ⏳ — Adaptive engine, memory system, multi-agent orchestration
- **Phase 4** ⏳ — Advanced analytics, A/B testing, feedback loops
- **Phase 5** ⏳ — Multi-modal content, voice interface
- **Phase 6** ⏳ — Production hardening, deployment, monitoring

## Directory Structure (Phase 2+)

```
ai-service/
├── providers/          ← LLM provider configs (Phase 1 stubs)
├── agents/             ← Multi-agent system (Phase 3)
├── knowledge/          ← Knowledge graph logic (Phase 2)
├── memory/             ← Student memory system (Phase 3)
├── recommendations/    ← Adaptive engine (Phase 2)
├── assessment/         ← AI assessment generation (Phase 2)
└── api/                ← FastAPI server (Phase 2)
```
