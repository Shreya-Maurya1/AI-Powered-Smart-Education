import { env } from '../config/env';

export interface LearningDecision {
  action: 'REVISE' | 'PRACTICE' | 'ASSESS' | 'EXPLAIN' | 'CODE' | 'ADVANCE';
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  reason: string;
  confidence: number;
  recommended_prerequisite?: string | null;
}

export interface LearningStateAnalysis {
  current_mastery: number;
  knowledge_gap: number;
  confidence: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  recent_mistakes: number;
  prerequisite_satisfied: boolean;
  recommended_strategy: string;
}

export interface AIResponse {
  success: boolean;
  agent_selected: string;
  decision?: LearningDecision | null;
  analysis?: LearningStateAnalysis | null;
  action_result?: Record<string, any> | null;
  evaluation?: Record<string, any> | null;
  output: string;
  tool_calls_made: Array<Record<string, any>>;
  metadata: Record<string, any>;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  version: string;
  phase: string;
  frameworks: string[];
}

class AIServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI Service request failed [${response.status} ${response.statusText}]: ${errorText}`);
      }

      return (await response.json()) as T;
    } catch (error: any) {
      console.error(`[AIServiceClient] Error calling ${endpoint}:`, error.message);
      throw error;
    }
  }

  /**
   * Health check to verify AI Service status and version
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return this.request<HealthCheckResponse>('/health', {
      method: 'GET',
    });
  }

  /**
   * Request adaptive learning decision from Learning Adaptation Agent (LangGraph workflow)
   */
  async getLearningDecision(
    studentId: string,
    topic?: string,
    studentResponse?: string,
    targetMastery: number = 0.75,
    context: Record<string, any> = {}
  ): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/learning', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        topic,
        student_response: studentResponse,
        target_mastery: targetMastery,
        context,
      }),
    });
  }

  /**
   * Ask Socratic Tutor question
   */
  async askTutor(
    studentId: string,
    question: string,
    topic?: string,
    context: Record<string, any> = {}
  ): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/tutor', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        question,
        topic,
        context,
      }),
    });
  }

  /**
   * Generate adaptive diagnostic assessment
   */
  async generateAssessment(
    studentId: string,
    courseId: string = 'course-python-001',
    topic?: string,
    numQuestions: number = 3,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM',
    context: Record<string, any> = {}
  ): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/assessment', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        course_id: courseId,
        topic,
        num_questions: numQuestions,
        difficulty,
        context,
      }),
    });
  }

  /**
   * Evaluate student code and get guided hints
   */
  async evaluateCode(
    studentId: string,
    problemDescription: string,
    studentCode?: string,
    topic: string = 'Python Basics'
  ): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/coding', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        problem_description: problemDescription,
        student_code: studentCode,
        topic,
      }),
    });
  }

  /**
   * Orchestrate dynamic multi-agent request
   */
  async orchestrate(
    studentId: string,
    query?: string,
    objective?: string,
    context: Record<string, any> = {}
  ): Promise<AIResponse> {
    return this.request<AIResponse>('/ai/orchestrate', {
      method: 'POST',
      body: JSON.stringify({
        student_id: studentId,
        query,
        objective,
        context,
      }),
    });
  }
}

export const aiServiceClient = new AIServiceClient();
