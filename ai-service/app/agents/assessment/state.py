from typing import TypedDict, Optional, List, Dict, Any
from app.schemas import LearningDecision


class AssessmentState(TypedDict):
    student_id: str
    course_id: Optional[str]
    topic: str
    num_questions: int
    difficulty: str
    generated_questions: List[Dict[str, Any]]
    student_response: Optional[str]
    question_type: str  # 'OBJECTIVE' or 'SUBJECTIVE'
    evaluation_result: Optional[Dict[str, Any]]
    rubric_breakdown: Optional[Dict[str, Any]]
    overall_score: float
    passed: bool
    mastery_update: Optional[Dict[str, Any]]
    decision: Optional[LearningDecision]
    tool_calls_made: List[Dict[str, Any]]
    logs: List[str]
