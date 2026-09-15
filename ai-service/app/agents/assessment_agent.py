from typing import Optional, Dict, Any
from app.schemas import AIResponse, LearningDecision
from app.tools.backend_tools import create_quiz, evaluate_answer

def run_assessment_agent(
    student_id: str,
    course_id: Optional[str] = "course-python-001",
    topic: Optional[str] = "Python Basics",
    num_questions: int = 3
) -> AIResponse:
    """Assessment Agent stub (Phase 3 skeleton)."""
    quiz_data = create_quiz.invoke({
        "course_id": course_id or "course-python-001",
        "topic": topic or "Python Basics",
        "num_questions": num_questions
    })

    decision = LearningDecision(
        action="ASSESS",
        topic=topic or "Python Basics",
        difficulty="MEDIUM",
        reason="Evaluating student competency through diagnostic questions.",
        confidence=0.88
    )

    return AIResponse(
        success=True,
        agent_selected="assessment_agent",
        decision=decision,
        output=f"[Assessment Agent] Prepared diagnostic quiz for '{topic}' with {num_questions} questions.",
        tool_calls_made=[
            {"tool": "create_quiz", "input": {"course_id": course_id, "topic": topic}}
        ],
        metadata={
            "assessment": quiz_data,
            "phase": "Phase 3 Skeleton"
        }
    )
