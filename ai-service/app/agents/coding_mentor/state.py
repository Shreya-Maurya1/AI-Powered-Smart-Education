from typing import TypedDict, Optional, Dict, Any, List
from app.schemas import LearningDecision


class CodingMentorState(TypedDict):
    student_id: str
    problem_description: str
    topic: str
    student_code: Optional[str]
    is_safe: bool
    safety_violation: Optional[str]
    execution_success: bool
    stdout: Optional[str]
    stderr: Optional[str]
    execution_time_ms: float
    feedback: Optional[str]
    hint: Optional[str]
    decision: Optional[LearningDecision]
    tool_calls_made: List[Dict[str, Any]]
    logs: List[str]
