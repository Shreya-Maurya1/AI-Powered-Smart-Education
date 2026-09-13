from typing import Optional, Dict, Any
from app.schemas import AIResponse, LearningDecision, LearningStateAnalysis
from app.agents.learning_adaptation.graph import learning_adaptation_app

def run_learning_adaptation_agent(
    student_id: str,
    topic: Optional[str] = None,
    student_response: Optional[str] = None,
    target_mastery: Optional[float] = 0.75,
    max_iterations: int = 2,
    context: Optional[Dict[str, Any]] = None,
) -> AIResponse:
    """
    Invoke the Learning Adaptation Agent LangGraph workflow.
    Executes parallel context ingestion, state analysis, decision policy,
    tool execution, answer evaluation, state persistence, and re-planning loop.
    """
    effective_topic = topic or "Python Recursion"
    session_id = f"adapt-{student_id}-{effective_topic.replace(' ', '-').lower()}"
    config = {"configurable": {"thread_id": session_id}}

    initial_state = {
        "student_id": student_id,
        "objective": f"Improve student mastery of '{effective_topic}' through continuous adaptation.",
        "topic": effective_topic,
        "current_mastery": None,  # Will be extracted in load_context
        "target_mastery": target_mastery or 0.75,
        "student_profile": context or {},
        "mastery_data": {},
        "memory_data": [],
        "history_data": [],
        "prerequisites": [],
        "context": context or {},
        "analysis": None,
        "decision": None,
        "action_result": None,
        "student_response": student_response,
        "evaluation": None,
        "knowledge_change": 0.0,
        "iteration_count": 0,
        "max_iterations": max_iterations,
        "goal_complete": False,
        "tool_calls_made": [],
        "logs": []
    }

    from app.debugging.tracer import tracer
    import time

    objective = f"Improve student mastery of '{effective_topic}' through continuous adaptation."
    run_id = tracer.start_run(
        agent="learning_adaptation_agent",
        objective=objective,
        student_id=student_id,
        topic=effective_topic,
        metadata={"target_mastery": target_mastery, "max_iterations": max_iterations}
    )

    t_start = time.monotonic()
    try:
        # Execute graph
        final_state = learning_adaptation_app.invoke(initial_state, config=config)
        graph_duration = round((time.monotonic() - t_start) * 1000, 2)
        tracer.record_node(run_id, "learning_adaptation_graph", graph_duration, "SUCCESS", f"Completed {final_state.get('iteration_count', 1)} iterations")
    except Exception as e:
        tracer.record_error(run_id, str(e), "graph_execution", "Engaging graceful fallback response")
        tracer.finish_run(run_id, status="DEGRADED_ERROR")
        return AIResponse(
            success=False,
            agent_selected="learning_adaptation_agent",
            decision=None,
            analysis=None,
            action_result={"error": str(e), "run_id": run_id},
            evaluation=None,
            output=f"Learning agent encountered a temporary service issue: {e}. Defaulting to guided review.",
            tool_calls_made=[],
            metadata={"run_id": run_id, "status": "DEGRADED"}
        )

    raw_decision = final_state.get("decision")
    if isinstance(raw_decision, dict):
        decision = LearningDecision(**raw_decision)
    elif raw_decision is not None:
        decision = raw_decision
    else:
        decision = None

    raw_analysis = final_state.get("analysis")
    if isinstance(raw_analysis, dict):
        analysis = LearningStateAnalysis(**raw_analysis)
    elif raw_analysis is not None:
        analysis = raw_analysis
    else:
        analysis = None

    action_result = final_state.get("action_result", {})
    evaluation = final_state.get("evaluation", {})
    tool_calls = final_state.get("tool_calls_made", [])
    logs = final_state.get("logs", [])
    current_mastery = final_state.get("current_mastery", 0.50)

    # Record tools and decisions into tracer
    for tc in tool_calls:
        tool_name = tc.get("tool", "unknown_tool")
        tracer.record_tool(
            run_id,
            tool=tool_name,
            duration_ms=tc.get("duration_ms", 12.0),
            status=tc.get("status", "SUCCESS"),
            input_summary={"student_id": student_id, "branch": tc.get("parallel_branch")},
            output_summary=tc.get("output_summary")
        )

    if decision:
        tracer.record_decision(
            run_id,
            action=decision.action,
            difficulty=decision.difficulty,
            reason=decision.reason,
            details={"current_mastery": current_mastery, "target": target_mastery}
        )

    # Compose output text
    action_name = decision.action if decision else "PRACTICE"
    diff_name = decision.difficulty if decision else "MEDIUM"
    
    if evaluation.get("status") == "evaluated":
        eval_status = "Correct" if evaluation.get("is_correct") else "Incorrect"
        delta_str = f"{final_state.get('knowledge_change', 0.0):+.2f}"
        output = (
            f"[Learning Adaptation Agent: Evaluated] Answer evaluated as {eval_status}. "
            f"Mastery adjusted by {delta_str} to {current_mastery * 100:.0f}%. "
            f"Next step: {action_name} ({diff_name}). {decision.reason if decision else ''}"
        )
    elif action_name == "ADVANCE":
        next_topic = action_result.get("nextTopic", "Advanced concepts")
        output = (
            f"[Learning Adaptation Agent: ADVANCE] Congratulations! Mastery of '{effective_topic}' "
            f"is at {current_mastery * 100:.0f}%. Advanced curriculum unlocked: '{next_topic}'."
        )
    else:
        output = (
            f"[Learning Adaptation Agent: {action_name}] Prescribed {action_name} at {diff_name} difficulty. "
            f"Current mastery: {current_mastery * 100:.0f}%. {decision.reason if decision else ''}"
        )

    # Finish trace
    tracer.finish_run(run_id, final_result={"action": action_name, "mastery": current_mastery, "output": output}, status="SUCCESS")

    return AIResponse(
        success=True,
        agent_selected="learning_adaptation_agent",
        decision=decision,
        analysis=analysis,
        action_result=action_result,
        evaluation=evaluation,
        output=output,
        tool_calls_made=tool_calls,
        metadata={
            "run_id": run_id,
            "phase": "Phase 4 Learning Adaptation Agent",
            "topic": effective_topic,
            "currentMastery": current_mastery,
            "targetMastery": target_mastery,
            "goalComplete": final_state.get("goal_complete", False),
            "iterationCount": final_state.get("iteration_count", 1),
            "sessionLogs": logs
        }
    )
