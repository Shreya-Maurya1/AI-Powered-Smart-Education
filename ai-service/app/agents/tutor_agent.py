from typing import Optional, Dict, Any
from app.schemas import AIResponse, LearningDecision
from app.tools.backend_tools import get_student_profile

def run_tutor_agent(
    student_id: str,
    question: str,
    topic: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None
) -> AIResponse:
    """Tutor Agent stub (Phase 3 skeleton)."""
    profile = get_student_profile.invoke({"student_id": student_id})
    style = profile.get("learningStyle", "visual")

    decision = LearningDecision(
        action="PRACTICE",
        topic=topic or "General Curriculum",
        difficulty="MEDIUM",
        reason=f"Interactive tutoring tailored to {style} learning style.",
        confidence=0.90
    )

    tutor_explanation = (
        f"[Tutor Agent ({style.upper()} Mode)] Here is the guidance for your question: '{question}'. "
        f"Remember that conceptual understanding is built step-by-step. "
        f"Let's break down {topic or 'the concept'} together!"
    )

    return AIResponse(
        success=True,
        agent_selected="tutor_agent",
        decision=decision,
        output=tutor_explanation,
        tool_calls_made=[
            {"tool": "get_student_profile", "input": {"student_id": student_id}}
        ],
        metadata={
            "learningStyle": style,
            "phase": "Phase 3 Skeleton"
        }
    )
