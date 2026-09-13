import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import (
    AIRequest,
    AIResponse,
    TutorRequest,
    AssessmentRequest,
    CodingRequest,
)
from app.orchestrator.router import router
from app.agents.tutor_agent import run_tutor_agent
from app.agents.assessment_agent import run_assessment_agent
from app.agents.learning_adaptation import run_learning_adaptation_agent
from app.agents.coding_agent import run_coding_agent

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
        "phase": "Phase 4 Complete: Learning Adaptation Agent",
        "frameworks": ["FastAPI", "LangChain", "LangGraph"],
    }


# 1. POST /ai/tutor
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


# 2. POST /ai/assessment
@app.post("/ai/assessment", response_model=AIResponse)
def assessment_endpoint(req: AssessmentRequest):
    try:
        return run_assessment_agent(
            student_id=req.student_id,
            course_id=req.course_id,
            topic=req.topic,
            num_questions=req.num_questions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 3. POST /ai/learning (Wires to the Learning Adaptation Agent)
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


# 4. POST /ai/coding
@app.post("/ai/coding", response_model=AIResponse)
def coding_endpoint(req: CodingRequest):
    try:
        return run_coding_agent(
            student_id=req.student_id,
            problem_description=req.problem_description,
            topic=req.topic,
            student_code=req.student_code,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# 5. POST /ai/orchestrate (Dynamic Orchestrator Router)
@app.post("/ai/orchestrate", response_model=AIResponse)
def orchestrate_endpoint(req: AIRequest):
    try:
        return router.dispatch(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True if settings.ENVIRONMENT == "development" else False,
    )
