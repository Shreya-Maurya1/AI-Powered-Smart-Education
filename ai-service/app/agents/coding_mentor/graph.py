from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.agents.coding_mentor.state import CodingMentorState
from app.agents.coding_mentor.nodes.analyze_code import analyze_code_node
from app.agents.coding_mentor.nodes.generate_feedback import generate_feedback_node
from app.agents.coding_mentor.nodes.update_progress import update_progress_node


def build_coding_mentor_graph():
    workflow = StateGraph(CodingMentorState)

    # Add Nodes
    workflow.add_node("analyze_code", analyze_code_node)
    workflow.add_node("generate_feedback", generate_feedback_node)
    workflow.add_node("update_progress", update_progress_node)

    # Add Edges
    workflow.add_edge(START, "analyze_code")
    workflow.add_edge("analyze_code", "generate_feedback")
    workflow.add_edge("generate_feedback", "update_progress")
    workflow.add_edge("update_progress", END)

    checkpointer = MemorySaver()
    return workflow.compile(checkpointer=checkpointer)


coding_mentor_app = build_coding_mentor_graph()
