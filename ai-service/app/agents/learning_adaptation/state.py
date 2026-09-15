import operator
from typing import TypedDict, Dict, Any, List, Optional, Annotated

class LearningAdaptationState(TypedDict):
    student_id: str
    objective: str
    topic: str
    current_mastery: float
    target_mastery: float
    student_profile: Dict[str, Any]
    
    # Parallel context branches
    mastery_data: Dict[str, Any]
    memory_data: List[Dict[str, Any]]
    history_data: List[Dict[str, Any]]
    prerequisites: List[Dict[str, Any]]
    context: Dict[str, Any]
    
    # Analysis and Decision (dict-serialized for clean checkpointer msgpack compatibility)
    analysis: Optional[Dict[str, Any]]
    decision: Optional[Dict[str, Any]]
    action_result: Optional[Dict[str, Any]]
    
    # Evaluation and Loop
    student_response: Optional[str]
    evaluation: Optional[Dict[str, Any]]
    knowledge_change: float
    iteration_count: int
    max_iterations: int
    goal_complete: bool
    
    # Diagnostics & Telemetry with append reducer for parallel fan-out
    tool_calls_made: Annotated[List[Dict[str, Any]], operator.add]
    logs: Annotated[List[str], operator.add]
