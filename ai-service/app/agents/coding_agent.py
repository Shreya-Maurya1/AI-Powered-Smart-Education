from typing import Optional
from app.schemas import AIResponse, LearningDecision

def run_coding_agent(
    student_id: str,
    problem_description: str,
    topic: Optional[str] = "Python Basics",
    student_code: Optional[str] = None
) -> AIResponse:
    """Coding Agent stub (Phase 3 skeleton)."""
    has_code = bool(student_code and student_code.strip())

    decision = LearningDecision(
        action="PRACTICE",
        topic=topic or "Python Basics",
        difficulty="MEDIUM",
        reason="Coding practice evaluation and feedback loop.",
        confidence=0.86
    )

    feedback = (
        f"[Coding Agent] Reviewing solution for problem: '{problem_description[:60]}...'. "
        + ("Code received and syntax checked cleanly. Consider edge cases for recursive depth."
           if has_code else
           "Ready to evaluate your code. Write your solution and submit for automated review.")
    )

    return AIResponse(
        success=True,
        agent_selected="coding_agent",
        decision=decision,
        output=feedback,
        tool_calls_made=[],
        metadata={
            "hasCodeSubmitted": has_code,
            "phase": "Phase 3 Skeleton"
        }
    )
