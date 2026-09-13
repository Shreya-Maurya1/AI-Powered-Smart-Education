import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from app.config import settings
from app.schemas import (
    AIRequest,
    AIResponse,
    TutorRequest,
    AssessmentRequest,
    CodingRequest,
)
from app.orchestrator.router import router
from app.agents.tutor import run_tutor_agent
from app.agents.assessment import run_assessment_agent
from app.agents.learning_adaptation import run_learning_adaptation_agent
from app.agents.coding_mentor import run_coding_mentor_agent
from app.rag.retriever import rag_retriever
from app.memory.memory import memory_system

app = FastAPI(
    title="AdaptiveMind AI Service",
    description="Multi-Agent AI Service built with FastAPI, LangChain, and LangGraph (SIH Problem Statement 19)",
    version="1.0.0",
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "adaptivemind-ai-service",
        "version": "1.0.0",
        "phase": "Phase 5 Complete: RAG, Specialized Agents & Memory System",
        "frameworks": ["FastAPI", "LangChain", "LangGraph", "pgvector"],
    }


# 1. POST /ai/tutor (Socratic Grounded Tutor with RAG & Memory)
@app.post("/ai/tutor", response_model=AIResponse)
def tutor_endpoint(req: TutorRequest):
    try:
        return run_tutor_agent(
            student_id=req.student_id,
            question=req.question,
            topic=req.topic,
            context=req.context,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 2. POST /ai/assessment (Diagnostic Assessment with Rubric Evaluation)
@app.post("/ai/assessment", response_model=AIResponse)
def assessment_endpoint(req: AssessmentRequest):
    try:
        student_response = req.context.get("student_response") if req.context else None
        return run_assessment_agent(
            student_id=req.student_id,
            course_id=req.course_id,
            topic=req.topic,
            num_questions=req.num_questions,
            difficulty=req.difficulty or "MEDIUM",
            student_response=student_response,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 3. POST /ai/learning (Wires to the centerpiece Learning Adaptation Agent)
@app.post("/ai/learning", response_model=AIResponse)
def learning_endpoint(req: AIRequest):
    try:
        return run_learning_adaptation_agent(
            student_id=req.student_id,
            topic=req.topic,
            student_response=req.student_response,
            target_mastery=req.target_mastery,
            context=req.context,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 4. POST /ai/coding (Safe Sandboxed Python Execution + Coding Mentor)
@app.post("/ai/coding", response_model=AIResponse)
def coding_endpoint(req: CodingRequest):
    try:
        return run_coding_mentor_agent(
            student_id=req.student_id,
            problem_description=req.problem_description,
            topic=req.topic,
            student_code=req.student_code,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 5. POST /ai/orchestrate (Dynamic Intent Classifier Router)
@app.post("/ai/orchestrate", response_model=AIResponse)
def orchestrate_endpoint(req: AIRequest):
    try:
        return router.dispatch(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 6. POST /ai/rag/retrieve (Direct semantic RAG search with citations)
@app.post("/ai/rag/retrieve")
def rag_retrieve_endpoint(payload: dict):
    query = payload.get("query", "")
    topic = payload.get("topic")
    top_k = payload.get("top_k", 3)
    results = rag_retriever.retrieve(query=query, topic=topic, top_k=top_k)
    citations = rag_retriever.format_citations(results)
    return {
        "success": True,
        "query": query,
        "topic": topic,
        "results": results,
        "citations": citations,
    }


# 7. GET /ai/memory/{student_id} (Student Memory Inspector)
@app.get("/ai/memory/{student_id}")
def memory_inspect_endpoint(student_id: str, topic: Optional[str] = None):
    memories = memory_system.retrieve_memory(student_id=student_id, topic=topic, top_k=10)
    return {
        "success": True,
        "student_id": student_id,
        "topic": topic,
        "memories": memories,
    }


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True if settings.ENVIRONMENT == "development" else False,
    )
