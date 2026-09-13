from typing import TypedDict, Optional, Dict, Any, List
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.schemas import LearningDecision
from app.tools.backend_tools import get_student_mastery, get_topic_prerequisites


# 1. State Definition
class DemoAgentState(TypedDict):
    student_id: str
    topic: Optional[str]
    mastery_data: Optional[Dict[str, Any]]
    tool_calls_made: List[Dict[str, Any]]
    decision: Optional[LearningDecision]
    action_result: Optional[str]
    final_output: Optional[str]


# 2. Node 1: Analyze Node (Executes Tool Call: Node -> Tool -> API -> Result -> Node)
def analyze_node(state: DemoAgentState) -> Dict[str, Any]:
    student_id = state.get("student_id", "demo-student")
    tool_calls = list(state.get("tool_calls_made", []))

    # Invoke tool get_student_mastery
    mastery_result = get_student_mastery.invoke({"student_id": student_id})
    tool_calls.append({
        "tool": "get_student_mastery",
        "input": {"student_id": student_id},
        "output_summary": f"Overall: {mastery_result.get('overallMasteryPercent', 50)}%"
    })

    return {
        "mastery_data": mastery_result,
        "tool_calls_made": tool_calls,
    }


# 3. Node 2: Decision Node (Returns Structured Pydantic LearningDecision)
def decision_node(state: DemoAgentState) -> Dict[str, Any]:
    mastery_data = state.get("mastery_data") or {}
    requested_topic = state.get("topic")

    # Find relevant topic score or use recommended lowest mastery
    recommended = mastery_data.get("recommendedRevisionTopic") or {}
    weak_topics = mastery_data.get("weakTopics", [])

    if requested_topic:
        target_topic = requested_topic
        # Check if topic is in weak topics
        is_weak = any(w.get("topic") == target_topic for w in weak_topics)
        score = 0.50
        if is_weak:
            score = 0.43
    else:
        target_topic = recommended.get("topic", "Python Functions")
        score = recommended.get("currentMastery", 0.50)

    # Deterministic rule-based decision logic (Pydantic schema output)
    if score < 0.60:
        action = "REVISE"
        difficulty = "EASY"
        reason = f"Current mastery in {target_topic} is low ({int(score * 100)}%). Recommend foundational review."
    elif score >= 0.80:
        action = "ADVANCE"
        difficulty = "HARD"
        reason = f"Student shows strong mastery in {target_topic} ({int(score * 100)}%). Ready for advanced challenges."
    else:
        action = "PRACTICE"
        difficulty = "MEDIUM"
        reason = f"Moderate mastery in {target_topic} ({int(score * 100)}%). Continue targeted practice."

    decision = LearningDecision(
        action=action,
        topic=target_topic,
        difficulty=difficulty,
        reason=reason,
        confidence=0.92,
        recommended_prerequisite=recommended.get("prerequisite", {}).get("prerequisiteTopic") if recommended else None
    )

    return {"decision": decision}


# 4. Conditional Edge Function
def route_after_decision(state: DemoAgentState) -> str:
    decision = state.get("decision")
    if not decision:
        return "action_standard"
    if decision.action == "REVISE":
        return "action_revise"
    elif decision.action == "ADVANCE":
        return "action_advance"
    return "action_standard"


# 5. Action Nodes
def action_revise_node(state: DemoAgentState) -> Dict[str, Any]:
    decision = state["decision"]
    tool_calls = list(state.get("tool_calls_made", []))

    # Tool call: fetch prerequisite dependencies
    prereqs = get_topic_prerequisites.invoke({})
    tool_calls.append({
        "tool": "get_topic_prerequisites",
        "input": {},
        "output_count": len(prereqs)
    })

    relevant_prereq = next((p.get("prerequisiteTopic") for p in prereqs if p.get("topic") == decision.topic), None)

    output = (
        f"[LangGraph Action: REVISE] Recommended revision for '{decision.topic}' "
        f"at {decision.difficulty} difficulty. "
    )
    if relevant_prereq:
        output += f"Prerequisite reinforcement suggested: '{relevant_prereq}'."

    return {
        "action_result": "Revision curriculum prepared",
        "final_output": output,
        "tool_calls_made": tool_calls
    }


def action_advance_node(state: DemoAgentState) -> Dict[str, Any]:
    decision = state["decision"]
    output = (
        f"[LangGraph Action: ADVANCE] Fast-tracking '{decision.topic}' to {decision.difficulty} difficulty. "
        f"Proceeding to higher-order concepts."
    )
    return {
        "action_result": "Advanced challenges generated",
        "final_output": output
    }


def action_standard_node(state: DemoAgentState) -> Dict[str, Any]:
    decision = state["decision"]
    output = (
        f"[LangGraph Action: PRACTICE] Standard practice track for '{decision.topic}' "
        f"at {decision.difficulty} difficulty."
    )
    return {
        "action_result": "Practice session activated",
        "final_output": output
    }


# 6. Build the LangGraph Workflow
def build_demo_graph():
    workflow = StateGraph(DemoAgentState)

    # Add Nodes
    workflow.add_node("analyze", analyze_node)
    workflow.add_node("decision", decision_node)
    workflow.add_node("action_revise", action_revise_node)
    workflow.add_node("action_advance", action_advance_node)
    workflow.add_node("action_standard", action_standard_node)

    # Add Edges
    workflow.add_edge(START, "analyze")
    workflow.add_edge("analyze", "decision")

    # Conditional Edges from Decision
    workflow.add_conditional_edges(
        "decision",
        route_after_decision,
        {
            "action_revise": "action_revise",
            "action_advance": "action_advance",
            "action_standard": "action_standard"
        }
    )

    # Complete to END
    workflow.add_edge("action_revise", END)
    workflow.add_edge("action_advance", END)
    workflow.add_edge("action_standard", END)

    # Compile with MemorySaver Checkpointer
    checkpointer = MemorySaver()
    compiled_app = workflow.compile(checkpointer=checkpointer)
    return compiled_app


# Singleton compiled graph
demo_graph_app = build_demo_graph()
