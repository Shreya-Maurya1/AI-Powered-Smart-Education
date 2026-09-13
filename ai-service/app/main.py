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


# 8. GET /ai/debugging/runs (List recent execution traces)
@app.get("/ai/debugging/runs")
def list_debugging_runs(limit: int = 50):
    from app.debugging.tracer import tracer
    return {
        "success": True,
        "count": len(tracer.list_runs(limit=limit)),
        "runs": tracer.list_runs(limit=limit),
    }


# 9. GET /ai/debugging/runs/{run_id} (Inspect single run JSON and text trace log)
@app.get("/ai/debugging/runs/{run_id}")
def get_debugging_run_detail(run_id: str):
    from app.debugging.tracer import tracer
    data = tracer.get_run_details(run_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found")
    return {
        "success": True,
        "run": data,
    }


# 10. GET /ai/debugging/evaluation (Automated Evaluation Metrics Suite)
@app.get("/ai/debugging/evaluation")
def evaluation_metrics_endpoint():
    from app.debugging.evaluation import run_full_system_evaluation
    try:
        results = run_full_system_evaluation()
        return {
            "success": True,
            "evaluation": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 11. GET /ai/debugging/benchmark (Sequential vs Parallel load_context Benchmark)
@app.get("/ai/debugging/benchmark")
def benchmark_endpoint(
    student_id: str = "cmtt5drap00021dekmkdu4xt4",
    topic: str = "Python Recursion",
    trials: int = 3,
):
    from app.debugging.benchmark import run_benchmark
    try:
        results = run_benchmark(student_id=student_id, topic=topic, trials=trials)
        return {
            "success": True,
            "benchmark": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True if settings.ENVIRONMENT == "development" else False,
    )
