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

    from app.debugging.tracer import tracer
    import time

    objective = f"Assess student mastery on '{effective_topic}' with rubric evaluation"
    run_id = tracer.start_run(
        agent="assessment_agent",
        objective=objective,
        student_id=student_id,
        topic=effective_topic,
        metadata={"difficulty": difficulty, "has_response": bool(student_response)}
    )

    t0 = time.monotonic()
    try:
        final_state = assessment_app.invoke(initial_state, config=config)
        graph_dur = round((time.monotonic() - t0) * 1000, 2)
        tracer.record_node(run_id, "assessment_graph", graph_dur, "SUCCESS", "Completed evaluation & mastery update")
    except Exception as e:
        tracer.record_error(run_id, str(e), "assessment_graph", "Returning fallback assessment response")
        tracer.finish_run(run_id, status="DEGRADED_ERROR")
        return AIResponse(
            success=False,
            agent_selected="assessment_agent",
            decision=None,
            analysis=None,
            action_result={"error": str(e), "run_id": run_id},
            evaluation=None,
            output=f"Assessment agent encountered an evaluation error: {e}",
            tool_calls_made=[],
            metadata={"run_id": run_id, "status": "DEGRADED"}
        )

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
        tracer.record_decision(
            run_id,
            action=decision.action if decision else "PRACTICE",
            difficulty=decision.difficulty if decision else "MEDIUM",
            reason=f"Assessment score: {score}%",
            details={"score": score, "passed": passed}
        )
    else:
        out_msg = (
            f"[Assessment Agent: Generated] Created {len(questions)} diagnostic questions for '{effective_topic}'."
        )

    tracer.finish_run(run_id, final_result={"score": score, "passed": passed, "questionsCount": len(questions)}, status="SUCCESS")

    return AIResponse(
        success=True,
        agent_selected="assessment_agent",
        decision=decision,
        analysis=None,
        action_result={
            "questions": questions,
            "overallScore": score,
            "passed": passed,
            "rubricBreakdown": rubric,
            "masteryUpdate": mastery_update,
        },
        evaluation=final_state.get("evaluation_result"),
        output=out_msg,
        tool_calls_made=final_state.get("tool_calls_made", []),
        metadata={
            "run_id": run_id,
            "phase": "Phase 5 Assessment Agent",
            "topic": effective_topic,
            "score": score,
            "passed": passed,
            "sessionLogs": logs,
        },
    )
