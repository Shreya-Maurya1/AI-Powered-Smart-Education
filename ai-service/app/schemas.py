from typing import Literal, Optional, Dict, Any, List
from pydantic import BaseModel, Field

# Learning State Analysis Schema (Phase 4)
class LearningStateAnalysis(BaseModel):
    current_mastery: float = Field(ge=0.0, le=1.0)
    knowledge_gap: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    difficulty: Literal["EASY", "MEDIUM", "HARD"] = "MEDIUM"
    recent_mistakes: int = 0
    prerequisite_satisfied: bool = True
    recommended_strategy: str = "PRACTICE"


# Structured Output - Learning Decision Schema (Extended for Phase 4)
class LearningDecision(BaseModel):
    action: Literal["REVISE", "PRACTICE", "ASSESS", "EXPLAIN", "CODE", "ADVANCE"]
    topic: str
    difficulty: Literal["EASY", "MEDIUM", "HARD"]
    reason: str
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    recommended_prerequisite: Optional[str] = None


class AIRequest(BaseModel):
    student_id: str
    query: Optional[str] = None
    topic: Optional[str] = None
    course_id: Optional[str] = None
    lesson_id: Optional[str] = None
    student_response: Optional[str] = None
    target_mastery: Optional[float] = 0.75
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    objective: Optional[str] = None  # e.g., "learning", "assessment", "tutor", "coding"


class AIResponse(BaseModel):
    success: bool = True
    agent_selected: str
    decision: Optional[LearningDecision] = None
    analysis: Optional[LearningStateAnalysis] = None
    action_result: Optional[Dict[str, Any]] = None
    evaluation: Optional[Dict[str, Any]] = None
    output: str
    tool_calls_made: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class TutorRequest(BaseModel):
    student_id: str
    topic: Optional[str] = None
    question: str
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)


class AssessmentRequest(BaseModel):
    student_id: str
    course_id: Optional[str] = "course-python-001"
    topic: Optional[str] = None
    num_questions: int = 3
    difficulty: Optional[Literal["EASY", "MEDIUM", "HARD"]] = "MEDIUM"
    student_response: Optional[str] = None
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)


class CodingRequest(BaseModel):
    student_id: str
    topic: Optional[str] = "Python Basics"
    problem_description: str
    student_code: Optional[str] = None
