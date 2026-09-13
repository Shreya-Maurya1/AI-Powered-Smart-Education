from typing import TypedDict, Optional, List, Dict, Any
from app.schemas import LearningDecision


class TutorState(TypedDict):
    student_id: str
    question: str
    topic: Optional[str]
    context: Optional[Dict[str, Any]]
    rag_chunks: List[Dict[str, Any]]
    memories: List[Dict[str, Any]]
    generated_answer: Optional[str]
    validated_answer: Optional[str]
    citations: Optional[str]
    memory_active: bool
    grounding_score: float
    decision: Optional[LearningDecision]
    tool_calls_made: List[Dict[str, Any]]
    logs: List[str]
