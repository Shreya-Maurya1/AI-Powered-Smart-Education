from typing import Optional
from app.schemas import AIRequest, AIResponse
from app.agents.learning_adaptation import run_learning_adaptation_agent
from app.agents.assessment_agent import run_assessment_agent
from app.agents.tutor_agent import run_tutor_agent
from app.agents.coding_agent import run_coding_agent

class AgentRouter:
    """Lightweight orchestrator router that inspects the incoming request and routes to the appropriate agent."""

    @staticmethod
    def determine_agent(request: AIRequest) -> str:
        # 1. Explicit objective takes priority
        if request.objective:
            obj = request.objective.lower()
            if "assess" in obj or "quiz" in obj:
                return "assessment"
            elif "tutor" in obj or "explain" in obj:
                return "tutor"
            elif "code" in obj or "coding" in obj:
                return "coding"
            elif "learn" in obj or "adaptation" in obj:
                return "learning"

        # 2. Inspect query content heuristics
        if request.query:
            q = request.query.lower()
            if any(k in q for k in ["code", "function", "debug", "algorithm", "syntax", "program"]):
                return "coding"
            if any(k in q for k in ["quiz", "test", "exam", "assessment", "score"]):
                return "assessment"
            if any(k in q for k in ["why", "how", "explain", "help", "what is", "teach me"]):
                return "tutor"

        # 3. Default to learning adaptation agent
        return "learning"

    @classmethod
    def dispatch(cls, request: AIRequest) -> AIResponse:
        agent_type = cls.determine_agent(request)

        if agent_type == "assessment":
            return run_assessment_agent(
                student_id=request.student_id,
                course_id=request.course_id,
                topic=request.topic,
            )
        elif agent_type == "tutor":
            return run_tutor_agent(
                student_id=request.student_id,
                question=request.query or "Explain this topic.",
                topic=request.topic,
                context=request.context,
            )
        elif agent_type == "coding":
            return run_coding_agent(
                student_id=request.student_id,
                problem_description=request.query or "Write a Python script",
                topic=request.topic,
                student_code=request.context.get("code") if request.context else None,
            )
        else:
            return run_learning_adaptation_agent(
                student_id=request.student_id,
                topic=request.topic,
                student_response=request.student_response,
                target_mastery=request.target_mastery,
                context=request.context,
            )

router = AgentRouter()
