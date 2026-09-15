from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.agents.tutor.state import TutorState
from app.agents.tutor.nodes.retrieve_context import retrieve_context_node
from app.agents.tutor.nodes.generate_response import generate_response_node
from app.agents.tutor.nodes.validate_response import validate_response_node


def build_tutor_graph():
    workflow = StateGraph(TutorState)

    # Add Nodes
    workflow.add_node("retrieve_context", retrieve_context_node)
    workflow.add_node("generate_response", generate_response_node)
    workflow.add_node("validate_response", validate_response_node)

    # Add Edges
    workflow.add_edge(START, "retrieve_context")
    workflow.add_edge("retrieve_context", "generate_response")
    workflow.add_edge("generate_response", "validate_response")
    workflow.add_edge("validate_response", END)

    checkpointer = MemorySaver()
    return workflow.compile(checkpointer=checkpointer)


tutor_app = build_tutor_graph()
