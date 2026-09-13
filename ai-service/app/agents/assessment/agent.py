from typing import Optional, Dict, Any
from app.schemas import AIResponse
from app.agents.assessment.graph import assessment_app


def run_assessment_agent(
    student_id: str,
    course_id: Optional[str] = None,
    topic: Optional[str] = None,
    num_questions: int = 2,
    difficulty: str = "MEDIUM",
    student_response: Optional[str] = None,
) -> AIResponse:
    """
    Executes the Assessment Agent workflow:
    START -> generate_assessment -> evaluate_answer (Objective / Rubric Subjective) -> update_mastery -> END
    """
    effective_topic = topic or "Python Recursion"
    session_id = f"assess-{student_id}-{effective_topic.replace(' ', '-').lower()}"
    config = {"configurable": {"thread_id": session_id}}

    initial_state = {
        "student_id": student_id,
        "course_id": course_id,
        "topic": effective_topic,
        "num_questions": num_questions,
        "difficulty": difficulty,
        "generated_questions": [],
        "student_response": student_response,
        "question_type": "MIXED",
        "evaluation_result": None,
        "rubric_breakdown": None,
        "overall_score": 0.0,
        "passed": False,
        "mastery_update": None,
        "decision": None,
        "tool_calls_made": [],
        "logs": [],
    }

    final_state = assessment_app.invoke(initial_state, config=config)

    questions = final_state.get("generated_questions", [])
    rubric = final_state.get("rubric_breakdown")
    score = final_state.get("overall_score", 0.0)
    passed = final_state.get("passed", False)
    mastery_update = final_state.get("mastery_update")
    decision = final_state.get("decision")
    logs = final_state.get("logs", [])

    if student_response:
        eval_type = rubric.get("evaluation_type") if rubric else "EVALUATED"
        out_msg = (
            f"[Assessment Agent: {eval_type}] Overall Score: {score:.1f}% ({'PASSED' if passed else 'FAILED'}). "
            f"Next recommended action: {decision.action if decision else 'PRACTICE'} ({decision.difficulty if decision else 'MEDIUM'})."
        )
    else:
        out_msg = (
            f"[Assessment Agent: Generated] Created {len(questions)} diagnostic questions for '{effective_topic}'."
        )

    return AIResponse(
        success=True,
        agent_selected="assessment_agent",
        decision=decision,
        analysis=None,
        action_result={
            "questions": questions,
            "rubricBreakdown": rubric,
            "overallScore": score,
            "passed": passed,
            "masteryUpdate": mastery_update,
        },
        evaluation=final_state.get("evaluation_result"),
        output=out_msg,
        tool_calls_made=final_state.get("tool_calls_made", []),
        metadata={
            "phase": "Phase 5 Assessment Agent",
            "topic": effective_topic,
            "score": score,
            "passed": passed,
            "sessionLogs": logs,
        },
    )
