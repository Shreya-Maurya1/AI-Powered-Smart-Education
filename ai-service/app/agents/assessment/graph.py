from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.agents.assessment.state import AssessmentState
from app.agents.assessment.nodes.generate_assessment import generate_assessment_node
from app.agents.assessment.nodes.evaluate_answer import evaluate_answer_node
from app.agents.assessment.nodes.update_mastery import update_mastery_node


def build_assessment_graph():
    workflow = StateGraph(AssessmentState)

    # Add Nodes
    workflow.add_node("generate_assessment", generate_assessment_node)
    workflow.add_node("evaluate_answer", evaluate_answer_node)
    workflow.add_node("update_mastery", update_mastery_node)

    # Add Edges
    workflow.add_edge(START, "generate_assessment")
    workflow.add_edge("generate_assessment", "evaluate_answer")
    workflow.add_edge("evaluate_answer", "update_mastery")
    workflow.add_edge("update_mastery", END)

    checkpointer = MemorySaver()
    return workflow.compile(checkpointer=checkpointer)


assessment_app = build_assessment_graph()
