from typing import Dict, Any
from app.agents.learning_adaptation.state import LearningAdaptationState
from app.tools.backend_tools import (
    get_student_mastery,
    retrieve_memory,
    get_learning_history,
    get_topic_prerequisites
)

import logging

logger = logging.getLogger("adaptivemind.learning_adaptation.load_context")

# Parallel Branch 1: Fetch student mastery
def fetch_mastery_node(state: LearningAdaptationState) -> Dict[str, Any]:
    student_id = state.get("student_id", "")
    try:
        tool_res = get_student_mastery.invoke({"student_id": student_id})
        status = "SUCCESS"
    except Exception as e:
        logger.warning(f"Mastery tool unavailable for student {student_id}: {e}. Continuing with baseline mastery.")
        tool_res = {"overallMastery": 0.50, "allMasteries": []}
        status = "DEGRADED"

    return {
        "mastery_data": tool_res,
        "tool_calls_made": [
            {"tool": "get_student_mastery", "student_id": student_id, "parallel_branch": 1, "status": status}
        ]
    }

# Parallel Branch 2: Fetch student memory
def fetch_memory_node(state: LearningAdaptationState) -> Dict[str, Any]:
    student_id = state.get("student_id", "")
    topic = state.get("topic", "")
    try:
        tool_res = retrieve_memory.invoke({"student_id": student_id, "query": topic})
        status = "SUCCESS"
    except Exception as e:
        logger.warning(f"Memory unavailable for {student_id}: {e} -> continue using current state.")
        tool_res = []
        status = "DEGRADED_FALLBACK"

    return {
        "memory_data": tool_res,
        "tool_calls_made": [
            {"tool": "retrieve_memory", "student_id": student_id, "parallel_branch": 2, "status": status}
        ]
    }

# Parallel Branch 3: Fetch learning history
def fetch_history_node(state: LearningAdaptationState) -> Dict[str, Any]:
    student_id = state.get("student_id", "")
    try:
        tool_res = get_learning_history.invoke({"student_id": student_id})
        status = "SUCCESS"
    except Exception as e:
        logger.warning(f"Learning history unavailable for {student_id}: {e}. Continuing without past logs.")
        tool_res = []
        status = "DEGRADED_FALLBACK"

    return {
        "history_data": tool_res,
        "tool_calls_made": [
            {"tool": "get_learning_history", "student_id": student_id, "parallel_branch": 3, "status": status}
        ]
    }

# Convergence Node: Combine all parallel outputs into unified context
def combine_context_node(state: LearningAdaptationState) -> Dict[str, Any]:
    mastery_data = state.get("mastery_data", {})
    memory_data = state.get("memory_data", [])
    history_data = state.get("history_data", [])
    topic = state.get("topic") or "Python Recursion"
    
    # Extract existing topic mastery score if present
    current_mastery = state.get("current_mastery")
    if current_mastery is None:
        # Look up from mastery_data
        topic_score = None
        for m in mastery_data.get("allMasteries", []):
            if m.get("topic", "").strip().lower() == topic.strip().lower():
                topic_score = m.get("masteryScore")
                break
        if topic_score is None:
            for item in mastery_data.get("weakTopics", []) + mastery_data.get("strongTopics", []):
                if item.get("topic", "").strip().lower() == topic.strip().lower():
                    topic_score = item.get("score")
                    break
        current_mastery = topic_score if topic_score is not None else 0.50

    # Fetch prerequisite dependencies
    prereqs = get_topic_prerequisites.invoke({})

    combined_context = {
        "mastery_data": mastery_data,
        "memory_data": memory_data,
        "history_data": history_data,
        "topic": topic,
        "current_mastery": current_mastery,
        "prerequisites": prereqs
    }

    return {
        "topic": topic,
        "current_mastery": current_mastery,
        "prerequisites": prereqs,
        "context": combined_context,
        "logs": [
            f"[load_context] Parallel fan-in complete. Initial mastery for '{topic}': {current_mastery * 100:.0f}%"
        ]
    }
