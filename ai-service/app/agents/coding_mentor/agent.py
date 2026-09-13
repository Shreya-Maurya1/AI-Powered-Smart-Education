from typing import Optional
from app.schemas import AIResponse
from app.agents.coding_mentor.graph import coding_mentor_app


def run_coding_mentor_agent(
    student_id: str,
    problem_description: str,
    topic: Optional[str] = None,
    student_code: Optional[str] = None,
) -> AIResponse:
    """
    Executes the Coding Mentor Agent workflow:
    START -> analyze_code (Safe Sandbox) -> generate_feedback (Line-by-Line hints) -> update_progress -> END
    """
    effective_topic = topic or "Python Recursion"
    session_id = f"code-{student_id}-{effective_topic.replace(' ', '-').lower()}"
    config = {"configurable": {"thread_id": session_id}}

    initial_state = {
        "student_id": student_id,
        "problem_description": problem_description,
        "topic": effective_topic,
        "student_code": student_code,
        "is_safe": True,
        "safety_violation": None,
        "execution_success": False,
        "stdout": None,
        "stderr": None,
        "execution_time_ms": 0.0,
        "feedback": None,
        "hint": None,
        "decision": None,
        "tool_calls_made": [],
        "logs": [],
    }

    from app.debugging.tracer import tracer
    import time

    objective = f"Mentor student on coding problem '{problem_description[:50]}...' in {effective_topic}"
    run_id = tracer.start_run(
        agent="coding_mentor",
        objective=objective,
        student_id=student_id,
        topic=effective_topic,
        metadata={"has_code": bool(student_code)}
    )

    t0 = time.monotonic()
    try:
        final_state = coding_mentor_app.invoke(initial_state, config=config)
        graph_dur = round((time.monotonic() - t0) * 1000, 2)
        tracer.record_node(run_id, "coding_mentor_graph", graph_dur, "SUCCESS", "Completed AST check, sandbox run & feedback")
    except Exception as e:
        tracer.record_error(run_id, str(e), "coding_mentor_graph", "Returning safe fallback feedback")
        tracer.finish_run(run_id, status="DEGRADED_ERROR")
        return AIResponse(
            success=False,
            agent_selected="coding_mentor",
            decision=None,
            analysis=None,
            action_result={"error": str(e), "run_id": run_id},
            evaluation=None,
            output=f"Code execution sandbox encountered an error: {e}",
            tool_calls_made=[],
            metadata={"run_id": run_id, "status": "DEGRADED"}
        )

    feedback = final_state.get("feedback") or ""
    hint = final_state.get("hint") or ""
    stdout = final_state.get("stdout") or ""
    stderr = final_state.get("stderr") or ""
    success = final_state.get("execution_success", False)
    duration = final_state.get("execution_time_ms", 0.0)
    decision = final_state.get("decision")
    logs = final_state.get("logs", [])
    is_safe = final_state.get("is_safe", True)

    tracer.record_tool(
        run_id,
        tool="ast_sandbox",
        duration_ms=duration,
        status="SUCCESS" if success else ("REJECTED" if not is_safe else "RUNTIME_ERROR"),
        input_summary={"safe": is_safe},
        output_summary=stdout[:100] if stdout else stderr[:100]
    )

    output = f"{feedback}\n\n{hint}" if hint else feedback
    tracer.finish_run(run_id, final_result={"executionSuccess": success, "isSafe": is_safe}, status="SUCCESS")

    return AIResponse(
        success=True,
        agent_selected="coding_mentor",
        decision=decision,
        analysis=None,
        action_result={
            "executionSuccess": success,
            "stdout": stdout,
            "stderr": stderr,
            "durationMs": duration,
            "feedback": feedback,
            "hint": hint,
            "isSafe": is_safe,
        },
        evaluation={
            "status": "executed",
            "success": success,
            "runtimeMs": duration,
        },
        output=output,
        tool_calls_made=final_state.get("tool_calls_made", []),
        metadata={
            "run_id": run_id,
            "phase": "Phase 5 Coding Mentor",
            "topic": effective_topic,
            "executionSuccess": success,
            "sessionLogs": logs,
        },
    )
