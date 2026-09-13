from typing import Literal
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.agents.learning_adaptation.state import LearningAdaptationState
from app.agents.learning_adaptation.nodes.load_context import (
    fetch_mastery_node,
    fetch_memory_node,
    fetch_history_node,
    combine_context_node
)
from app.agents.learning_adaptation.nodes.analyze_learning_state import analyze_learning_state_node
from app.agents.learning_adaptation.nodes.decide_action import decide_action_node
from app.agents.learning_adaptation.nodes.execute_action import execute_action_node
from app.agents.learning_adaptation.nodes.evaluate_result import evaluate_result_node
from app.agents.learning_adaptation.nodes.update_state import update_state_node

# Conditional Edge router for re-planning loop
def goal_complete_router(state: LearningAdaptationState) -> Literal["loop", "end"]:
    goal_complete = state.get("goal_complete", False)
    iteration_count = state.get("iteration_count", 0)
    max_iterations = state.get("max_iterations", 1)
    evaluation = state.get("evaluation", {})
    decision = state.get("decision")

    # If action is ADVANCE, topic is mastered
    if isinstance(decision, dict):
        action = decision.get("action")
    elif decision is not None:
        action = getattr(decision, "action", None)
    else:
        action = None

    if action == "ADVANCE":
        return "end"

    # If goal is reached (e.g. mastery >= target threshold)
    if goal_complete:
        return "end"

    # If student needs to respond to the generated question/material
    if evaluation.get("status") == "pending_response":
        return "end"

    # If max iterations reached
    if iteration_count >= max_iterations:
        return "end"

    # Loop back to analyze the new learning state
    return "loop"


def create_learning_adaptation_graph():
    builder = StateGraph(LearningAdaptationState)

    # 1. Add Context Loading Nodes (Parallel branches + convergence)
    builder.add_node("fetch_mastery", fetch_mastery_node)
    builder.add_node("fetch_memory", fetch_memory_node)
    builder.add_node("fetch_history", fetch_history_node)
    builder.add_node("combine_context", combine_context_node)

    # 2. Add Core Processing Nodes
    builder.add_node("analyze_learning_state", analyze_learning_state_node)
    builder.add_node("decide_action", decide_action_node)
    builder.add_node("execute_action", execute_action_node)
    builder.add_node("evaluate_result", evaluate_result_node)
    builder.add_node("update_state", update_state_node)

    # 3. Parallel Fan-Out from START to the 3 context fetchers
    builder.add_edge(START, "fetch_mastery")
    builder.add_edge(START, "fetch_memory")
    builder.add_edge(START, "fetch_history")

    # 4. Parallel Fan-In convergence to combine_context
    builder.add_edge("fetch_mastery", "combine_context")
    builder.add_edge("fetch_memory", "combine_context")
    builder.add_edge("fetch_history", "combine_context")

    # 5. Sequential Execution Pipeline
    builder.add_edge("combine_context", "analyze_learning_state")
    builder.add_edge("analyze_learning_state", "decide_action")
    builder.add_edge("decide_action", "execute_action")
    builder.add_edge("execute_action", "evaluate_result")
    builder.add_edge("evaluate_result", "update_state")

    # 6. Re-Planning Loop Conditional Edge
    builder.add_conditional_edges(
        "update_state",
        goal_complete_router,
        {
            "loop": "analyze_learning_state",
            "end": END
        }
    )

    checkpointer = MemorySaver()
    return builder.compile(checkpointer=checkpointer)

# Singleton compiled graph instance
learning_adaptation_app = create_learning_adaptation_graph()
