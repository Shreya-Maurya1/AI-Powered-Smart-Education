# AdaptiveMind — AI-Powered Adaptive Smart Education Platform
 
> *An intelligent, data-driven education platform that dynamically understands student progress, computes topic mastery, tracks learning events, and delivers personalized learning paths.*

---

## 🏗️ Project Architecture

AdaptiveMind is structured as a decoupled monorepo containing a modern Next.js client, a high-performance Express/TypeScript backend, PostgreSQL relational database layer, and structured AI service stubs.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 Next.js 14 Web Client                   │
                  │ (TypeScript, Tailwind, /tutor, /coding, /learning, /dash)│
                  └───────────────────────────┬─────────────────────────────┘
                                              │ HTTP / REST API
                                              ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │                Node.js + Express Backend                │
                  │          (TypeScript, Prisma ORM, JWT, AI Proxy)        │
                  └──────────────┬──────────────────────────┬───────────────┘
                                 │                          │
                   Database SQL  │                          │ Proxy /api/ai/*
                                 ▼                          ▼
  ┌───────────────────────────────────────────────┐  ┌─────────────────────────────────────────────────────┐
  │         PostgreSQL 16 + pgvector              │  │         FastAPI AI Service (Port 8000)              │
  │ ├─ Relational: users, courses, assessments    │  │ ├─ Learning Adaptation Agent (Centerpiece)          │
  │ ├─ Mastery: student_mastery, learning_events  │  │ ├─ Socratic Tutor Agent (RAG + Memory citations)    │
  │ ├─ RAG: rag_documents, rag_document_chunks    │  │ ├─ Assessment Agent (Deterministic & 4-part Rubric) │
  │ └─ Memory: student_memories (3 tiers)         │  │ ├─ Coding Mentor (Sandboxed AST Execution)          │
  └───────────────────────────────────────────────┘  │ ├─ RAG Pipeline (loaders, embeddings, pgvector)     │
                                                     │ └─ Shared 3-Tier Memory System (Working/Episodic/Sem)│
                                                     └─────────────────────────────────────────────────────┘
```

### Layer Breakdown

1. **Frontend (`frontend/`)**: Next.js 14 App Router application:
   - **Student Portal**: Course browser, interactive lesson viewer, real-time quiz engine, topic mastery meters, recommended revision banner, Socratic AI Tutor (`/tutor`) with live citations drawer, and Interactive Python Coding Studio (`/coding`) with sandbox evaluation.
   - **Teacher Portal**: Class performance analytics, student roster, topic weakness breakdown, and activity monitoring.
2. **Backend (`backend/`)**: RESTful API built with Express, TypeScript, and Prisma ORM. Handles JWT authentication, role guards, assessment grading, event emission, mastery computation, and secure routing to the AI service.
3. **Database (`database/`)**: PostgreSQL 16 database with `pgvector` extension support:
   - `001_initial_schema.sql`: Core relational tables.
   - `002_seed_data.sql`: Seed demo users, courses, questions, and curriculum.
   - `003_phase2_mastery_and_dependencies.sql`: Mastery tracking, learning event audit logs, and prerequisite knowledge DAG.
   - `004_phase5_rag_and_memory.sql`: Vector extensions, `rag_documents`, `rag_document_chunks` (384-dimensional embeddings), and `student_memories` table.
4. **AI Service (`ai-service/`)**: Autonomous intelligence service built on FastAPI and LangGraph:
   - **Learning Adaptation Agent** (Phase 4): Central self-looping adaptive agent that optimizes student mastery.
   - **Socratic Tutor Agent** (Phase 5): Grounded conversational tutor retrieving curriculum RAG context and student memory.
   - **Assessment Agent** (Phase 5): Automatic evaluator handling deterministic objective questions and 4-criterion subjective rubric analysis.
   - **Coding Mentor** (Phase 5): Safe Python code execution sandbox with AST verification and pedagogical hint generation.
   - **Shared 3-Tier Memory System** (Phase 5): Working, Episodic, and Semantic memory system with gating and relevance retrieval.

---

## 📁 Monorepo Folder Architecture

```
adaptive-mind/
├── frontend/                     # Next.js 14 App Router Web Client
│   ├── src/
│   │   ├── app/                  # App Router pages (/login, /register, /dashboard, /courses, /learning, /assessment, /tutor, /coding, /profile, /teacher/*)
│   │   ├── components/           # Navbar, Sidebar, ProtectedRoute, CourseCard, QuizQuestion, StatsCard
│   │   ├── hooks/                # useAuth, useCourses, useProgress
│   │   ├── lib/                  # Axios API client, auth storage helpers, utility functions
│   │   └── types/                # TypeScript interfaces (User, StudentMastery, MasterySummary, LearningEventItem, TutorMessage, etc.)
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # Node.js + Express + Prisma REST API
│   ├── prisma/
│   │   └── schema.prisma         # Prisma data models & ENUMs
│   ├── src/
│   │   ├── config/               # Database singleton, environment loader, JWT secret
│   │   ├── controllers/          # Request handlers (auth, course, assessment, progress, user)
│   │   ├── middleware/           # JWT auth, role guard, global Zod & Prisma error handlers
│   │   ├── routes/               # Router endpoints (/api/auth, /api/courses, /api/assessments, /api/progress, /api/users, /api/ai)
│   │   ├── services/             # Business logic (authService, courseService, assessmentService, masteryService, progressService, aiServiceClient)
│   │   ├── utils/                # Response formatters, JWT generators, bcrypt helpers
│   │   └── index.ts              # Express application entrypoint
│   ├── package.json
│   └── tsconfig.json
│
├── database/                     # PostgreSQL Schemas & Migrations
│   ├── schema/
│   │   └── schema.sql            # Master PostgreSQL DDL schema definition
│   └── migrations/
│       ├── 001_initial_schema.sql # Initial tables DDL
│       ├── 002_seed_data.sql      # Seed demo users, courses, questions
│       ├── 003_phase2_mastery_and_dependencies.sql # Phase 2 mastery & dependency graph
│       └── 004_phase5_rag_and_memory.sql           # Phase 5 pgvector, RAG & memory tables
│
├── ai-service/                   # FastAPI + LangGraph AI Service
│   ├── app/
│   │   ├── agents/
│   │   │   ├── learning_adaptation/ # Phase 4 Centerpiece Adaptive Agent
│   │   │   ├── tutor/               # Phase 5 Socratic Tutor Agent
│   │   │   ├── assessment/          # Phase 5 Objective & Subjective Evaluator
│   │   │   └── coding_mentor/       # Phase 5 Python Sandbox & Coding Mentor
│   │   ├── memory/                  # Phase 5 Shared 3-Tier Memory System
│   │   ├── rag/                     # Phase 5 Document Loaders, Embeddings & pgvector Retriever
│   │   ├── tools/                   # Backend & Agent Tools
│   │   ├── config.py                # Environment & LLM provider configurations
│   │   └── main.py                  # FastAPI Application Entrypoint
│   ├── tests/
│   │   └── test_phase5.py           # Automated test suite for Phase 5 components
│   ├── pytest.ini
│   ├── requirements.txt
│   └── README.md
│
├── docs/                         # Documentation
├── docker-compose.yml            # Docker setup with pgvector/pgvector:pg16
├── package.json                  # Root npm workspaces configuration
└── README.md                     # Root project documentation
```

---

## 🗺️ 6-Phase Roadmap

| Phase | Name | Description | Status |
|---|---|---|---|
| **1** | Core Web Foundation | Monorepo scaffold, JWT auth, courses, lessons, quiz interface, UI shell | ✅ **Complete** |
| **2** | Data Foundation & Mastery Engine | `student_mastery`, `learning_events`, `topic_dependencies`, deterministic mastery calculation formula, analytics dashboards | ✅ **Complete** |
| **3** | AI Service Architecture & LangGraph Core | FastAPI microservice on port 8000, multi-agent endpoints, LangGraph cyclical graph foundation, state schemas, checkpoints | ✅ **Complete** |
| **4** | Learning Adaptation Agent (Centerpiece) | Autonomous self-looping agent: parallel context loading, rule/heuristic analysis, pedagogical action decision, evaluation & state feedback | ✅ **Complete** |
| **5** | Supporting Intelligence Layer | RAG pipeline (PostgreSQL + pgvector), Socratic Tutor Agent with citations, Assessment Agent (4-part rubric), Python Coding Sandbox, and Shared 3-Tier Memory System | ✅ **Complete** |
| **6** | Multi-Modal Content & Real-Time Voice | Diagram analysis, video keyframe indexing, real-time voice explanation interface, production hardening & scaling | ⏳ Planned |


---

## 📊 Phase 2 Data Model

Phase 2 establishes the data foundation required for intelligent understanding of student progress without ML or LLM overhead.

### 1. Student Mastery (`student_mastery`)
Tracks granular topic-level mastery scores for each student on a continuous scale from `0.0` (no understanding) to `1.0` (full mastery).
- **Columns**: `id`, `student_id`, `topic`, `mastery_score` (FLOAT), `updated_at`.
- **Constraint**: `UNIQUE(student_id, topic)`

### 2. Learning Events (`learning_events`)
An immutable audit log capturing every meaningful student action across the platform.
- **Columns**: `id`, `student_id`, `lesson_id` (NULLABLE), `topic` (NULLABLE), `event_type` (ENUM), `metadata` (JSONB), `created_at`.
- **Event Types**:
  - `LESSON_START`, `LESSON_COMPLETE`, `LESSON_COMPLETED`
  - `QUIZ_ATTEMPTED`
  - `QUESTION_CORRECT`, `QUESTION_WRONG`
  - `TOPIC_VIEW`, `TOPIC_REVISED`
  - `CODING_ATTEMPT`, `ASSESSMENT_START`, `ASSESSMENT_COMPLETE`

### 3. Topic Dependencies (`topic_dependencies`)
Defines the directed prerequisite knowledge graph between curriculum topics.
- **Columns**: `id`, `topic`, `prerequisite_topic`, `created_at`.
- **Constraint**: `UNIQUE(topic, prerequisite_topic)`
- **Seeded Graph Examples**:
  - `Control Flow` $\rightarrow$ `Python Variables`
  - `Python Functions` $\rightarrow$ `Control Flow`
  - `Python Recursion` $\rightarrow$ `Python Functions`
  - `Linear & Quadratic Eqs` $\rightarrow$ `Algebraic Expressions`
  - `Calculus Derivatives` $\rightarrow$ `Linear & Quadratic Eqs`
  - `SQL JOIN` $\rightarrow$ `SQL Basics`
  - `Advanced JOIN` $\rightarrow$ `SQL JOIN`
  - `Subqueries` $\rightarrow$ `Advanced JOIN`

---

## 🧮 Deterministic Mastery Calculation Formula

When a student submits an assessment, the backend computes topic mastery updates deterministically in `masteryService.ts`:

$$\text{new\_mastery} = \text{clamped}_{0.0}^{1.0} \left( \text{previous\_mastery} + \text{performance\_adjustment} - \text{repeated\_mistake\_penalty} \right)$$

### 1. Performance Adjustment ($\Delta_{\text{perf}}$)
- **Correct Answer ($\ge 60\%$ score on topic questions)**:
  $$\Delta_{\text{perf}} = +0.15 \times (1.0 - \text{previous\_mastery})$$
  *(Diminishing returns as mastery approaches 1.0)*
- **Incorrect Answer ($< 60\%$ score on topic questions)**:
  $$\Delta_{\text{perf}} = -0.10 \times \text{previous\_mastery}$$

### 2. Repeated Mistake Penalty ($P_{\text{mistake}}$)
If the student has answered questions in this topic incorrectly multiple times in recent learning events (last 7 days):
$$P_{\text{mistake}} = \min\left(0.15, \, 0.05 \times \text{recent\_wrong\_count}\right)$$

---

---

## 🎯 Phase 4: Learning Adaptation Agent (Centerpiece)

The Learning Adaptation Agent is the core autonomous decision-making engine of AdaptiveMind. It continuously optimizes student mastery on a given learning objective through an autonomous LangGraph cycle.

### LangGraph Cycle Flow
```
START ──► load_context ──► analyze_learning_state ──► decide_action ──► execute_action ──► evaluate_result ──► update_state
               ▲                                                                                                    │
               │                                                                                                    ▼
               └────────────────────── [Conditional Edge: goal_complete? == False] ◄────────────────────────────────┘
                                                              │
                                                     [goal_complete? == True]
                                                              ▼
                                                             END
```

- **Parallel Context Loading (`load_context.py`)**: Concurrently gathers `get_student_mastery()`, `get_learning_history()`, `get_topic_dependencies()`, and `retrieve_memory()`.
- **Learning State Analysis (`analyze_learning_state.py`)**: Computes learning velocity, identifies repeated mistake patterns, and flags prerequisite deficits.
- **Pedagogical Decision Engine (`decide_action.py`)**:
  - Mastery $< 0.3$: `PREREQUISITE_REVIEW` (reverts to unmastered foundation topics)
  - $0.3 \le \text{Mastery} < 0.6$: `EXPLAIN` (delivers Socratic conceptual breakdown)
  - $0.6 \le \text{Mastery} < 0.8$: `PRACTICE` (generates targeted reinforcement exercise)
  - Mastery $\ge 0.8$: `CHALLENGE` (advances to higher-order synthesis challenge)
  - Repeated Mistake Count $\ge 2$: `HINT` (provides scaffolded hint on stumbling block)
- **Execution & Evaluation (`execute_action.py` & `evaluate_result.py`)**: Dispatches the action to tools/subagents and scores the simulated student response.
- **State Feedback Loop (`update_state.py`)**: Increments iteration count, updates local mastery, saves episodic memory, and routes to `analyze_learning_state` until mastery threshold $\ge 0.85$ or max iterations (5) reached.

---

## 🧠 Phase 5: Supporting Intelligence Layer

Phase 5 builds the high-precision supporting intelligence infrastructure around the Phase 4 centerpiece.

### 1. RAG Pipeline (`ai-service/app/rag/`)
- **Document Loaders (`loaders.py`)**: Extracts curriculum material from PDF files (via `pypdf`) and raw text documents, splitting content into semantic chunks with overlap.
- **Dense Embeddings (`embeddings.py`)**: Generates normalized 384-dimensional vector embeddings with cosine similarity metric.
- **PGVector Retriever (`retriever.py`)**: Executes cosine distance searches (`<=>`) directly against PostgreSQL `rag_document_chunks` table using pgvector indexing, falling back gracefully to memory cache if database is disconnected.
- **Curriculum Citations**: Automatically formats verified source references appended to answers:
  ```markdown
  ### 📚 Referenced Curriculum Sources:
  - **[1] Mastering Recursion in Python: Call Stacks & Base Conditions** (Relevance: 94.2%)
    *"A recursive function solves a problem by calling a copy of itself..."*
  ```

### 2. Socratic Tutor Agent (`ai-service/app/agents/tutor/`)
- **Workflow**: `START` $\rightarrow$ `retrieve_context` (Parallel RAG & 3-tier memory query) $\rightarrow$ `generate_response` $\rightarrow$ `validate_response` $\rightarrow$ `END`.
- **Socratic Pedagogy**: Never simply gives away direct answers; guides the student with inquiry, analogies, and structured leading questions.
- **Frontend UI (`frontend/src/app/tutor/page.tsx`)**: Responsive chat interface featuring quick-prompt starters, active memory contextual pill, and a slide-out drawer showing all referenced curriculum citations with similarity confidence scores.

### 3. Assessment Agent (`ai-service/app/agents/assessment/`)
- **Objective Evaluation**: Instant deterministic validation for multiple-choice and true/false questions against verified answer keys.
- **Subjective Rubric Evaluation**: Grades written student explanations across 4 strict criteria:
  - **Accuracy (40%)**: Factual precision and technical correctness.
  - **Completeness (25%)**: Thoroughness in addressing all essential components of the question.
  - **Reasoning (25%)**: Causal depth, logical chain of thought, and mechanism explanation.
  - **Clarity (10%)**: Coherent structure, terminology, and articulation.
- **Mastery Auto-Update**: Directly syncs grade outcome to `student_mastery` and logs `learning_events`.

### 4. Safe Python Coding Mentor (`ai-service/app/agents/coding_mentor/`)
- **Security AST Sandbox (`nodes/analyze_code.py`)**: Inspects Abstract Syntax Tree prior to execution. Completely forbids dangerous modules (`os`, `subprocess`, `sys`, `shutil`, `socket`) and file I/O operations.
- **Subprocess Execution**: Executes code in an isolated subshell with strict resource limits and a 5.0s timeout to safely terminate infinite recursion loops.
- **Diagnostic Feedback (`nodes/generate_feedback.py`)**: Explains compiler tracebacks, missing base conditions, or failed test assertions pedagogically.
- **Frontend UI (`frontend/src/app/coding/page.tsx`)**: Dark-themed Python coding environment with syntax editor, starter challenges (Factorial, Fibonacci, Binary Search), execution console, and AI mentor coaching card.

### 5. Shared 3-Tier Memory System (`ai-service/app/memory/`)
Shared memory utility integrated across agents (not a standalone agent):
- **Tier 1: Working Memory**: In-session conversation context and transient student scratchpad.
- **Tier 2: Episodic Memory**: Concrete learning episodes, failed quiz attempts, recurrent misunderstandings, and problem-solving logs.
- **Tier 3: Semantic Memory**: Long-term generalized insights about the student (e.g. learning style preferences, mastery trajectory, conceptual strengths).
- **Gating Filter (`is_memory_useful`)**: Rejects trivial chit-chat or redundant entries; only stores actionable pedagogical signals.
- **Relevance Retrieval (`MemoryRetriever`)**: Ranks candidate memories using cosine similarity to the current topic, recency weighting, and importance score.

---

## 🚀 Setting Up & Running the Project

### Prerequisites
- **Node.js** $\ge 18.x$
- **Python** $\ge 3.10$
- **Docker & Docker Compose** (for PostgreSQL + pgvector)

---

### Step 1: Start PostgreSQL Database with pgvector

```bash
# In the root adaptive-mind directory:
npm run db:up

# Verify the container is running pgvector/pgvector:pg16
docker ps
```

---

### Step 2: Initialize Database Schemas & Migrations

```bash
# Apply Prisma schema for relational tables
cd backend
npm install
npx prisma generate
npx prisma db push

# Apply Phase 2 and Phase 5 SQL migrations (vector extension & seed curriculum)
docker exec -i adaptivemind_db psql -U adaptivemind -d adaptivemind_db < ../database/migrations/001_initial_schema.sql
docker exec -i adaptivemind_db psql -U adaptivemind -d adaptivemind_db < ../database/migrations/002_seed_data.sql
docker exec -i adaptivemind_db psql -U adaptivemind -d adaptivemind_db < ../database/migrations/003_phase2_mastery_and_dependencies.sql
docker exec -i adaptivemind_db psql -U adaptivemind -d adaptivemind_db < ../database/migrations/004_phase5_rag_and_memory.sql
```

---

### Step 3: Launch AI Service (Python FastAPI)

```bash
cd ai-service

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated test suite
pytest tests/test_phase5.py

# Start FastAPI server on port 8000
uvicorn app.main:app --port 8000 --reload
# Health check: http://localhost:8000/health
# OpenAPI Docs: http://localhost:8000/docs
```

---

### Step 4: Launch Backend API (Express + TypeScript)

```bash
cd backend

# Start development server
npm run dev

# API will start on http://localhost:5000
# Health check: http://localhost:5000/health
```

---

### Step 5: Launch Next.js Web Client

```bash
cd frontend

# Start Next.js development server
npm run dev

# Web client will start on http://localhost:3000
```

---

### 🔑 Demo Accounts

| Role | Email | Password | Available Pages |
|---|---|---|---|
| **Student** | `student@adaptivemind.dev` | `Student@123` | `/dashboard`, `/courses`, `/learning`, `/assessment`, `/tutor`, `/coding`, `/profile` |
| **Teacher** | `teacher@adaptivemind.dev` | `Teacher@123` | `/teacher/dashboard`, `/teacher/students`, `/teacher/analytics` |

---

## 📝 Progress Log

### 2026-08-08 — Phase 1 Complete ✅
- **Monorepo setup**: Next.js 14 App Router client, Express/TypeScript backend, PostgreSQL DDL schemas.
- **Core functionality**: User authentication (JWT + bcrypt), role selection, course browser, lesson viewer, quiz engine, profile page.

### 2026-09-09 — Phase 2 Complete ✅
- **Data Foundation**: Added `student_mastery`, `learning_events`, and `topic_dependencies` tables.
- **Deterministic Mastery Engine**: Built `masteryService.ts` executing the formula:
  $$\text{new\_mastery} = \text{previous\_mastery} + \text{performance\_adjustment} - \text{repeated\_mistake\_penalty}$$
- **Event Telemetry**: Automatically emits `QUIZ_ATTEMPTED`, `QUESTION_CORRECT`, `QUESTION_WRONG`, and `LESSON_COMPLETED` events on every student action.
- **Prerequisite Topic Graph**: Seeded dependency graph (e.g. `JOIN` $\rightarrow$ `Advanced JOIN` $\rightarrow$ `Subqueries`).
- **Student Dashboard**: Overall topic mastery meter, recommended revision card with prerequisite status, strong/weak topic badges, and learning event stream.
- **Teacher Dashboard**: Real-time class mastery averages, identified weak topic clusters, student roster performance, and activity monitoring.
- **Codebase Clean Refactor**: Removed duplicate/unwanted root configuration files and verified clean TypeScript compilation (`0` errors across backend and frontend).

### 2026-09-12 — Phase 3 Complete ✅
- **AI Microservice Skeleton**: Established `ai-service/` with FastAPI application on port 8000.
- **LangGraph Fundamentals**: Built minimal cyclical LangGraph validating state schemas, node transitions, checkpoints (`MemorySaver`), and tool executions.
- **API Endpoints**: Mounted `/ai/tutor`, `/ai/assessment`, `/ai/learning`, `/ai/coding` with standard JSON response schemas.
- **Backend AI Proxy**: Wired `aiServiceClient.ts` into Express backend to securely broker AI requests between frontend and Python service.

### 2026-09-13 — Phase 4 Complete ✅
- **Learning Adaptation Agent**: Built the autonomous self-looping LangGraph agent (`ai-service/app/agents/learning_adaptation/`).
- **Parallel Fan-out**: Concurrent execution of `get_student_mastery`, `get_learning_history`, `get_topic_dependencies`, and `retrieve_memory`.
- **Dynamic Decision Matrix**: Rule- and heuristic-based adaptation selecting `PREREQUISITE_REVIEW`, `EXPLAIN`, `PRACTICE`, `CHALLENGE`, or `HINT`.
- **Continuous Evaluation Loop**: Agent executes pedagogical intervention, scores response, updates state, and continues iterating until objective mastery threshold $\ge 0.85$ or limit reached.

### 2026-09-14 — Phase 5 Complete ✅
- **PostgreSQL pgvector Migration**: Migrated Docker PostgreSQL container to `pgvector/pgvector:pg16` with vector indexing (`004_phase5_rag_and_memory.sql`).
- **RAG Pipeline**: Implemented document chunking, 384-dimensional dense vector embeddings, and pgvector retriever with automatic source citation formatting.
- **Socratic Tutor Agent**: Built conversational Socratic graph pulling curriculum context and student memory concurrently, with live citation verification.
- **Assessment Agent**: Implemented dual evaluation supporting deterministic objective answer matching and 4-criterion subjective rubric grading (Accuracy 40%, Completeness 25%, Reasoning 25%, Clarity 10%).
- **Safe Python Coding Mentor**: Built AST-secured execution sandbox prohibiting unsafe system libraries, guarding against infinite recursion, and delivering guided hints.
- **Shared 3-Tier Memory System**: Created Working, Episodic, and Semantic memory system with `is_memory_useful` signal gating and cosine relevance retrieval.
- **Frontend Expansion**: Implemented Socratic Tutor chat page (`/tutor`) with citations drawer and Python Coding Studio (`/coding`) with execution console and mentor feedback.
- **Automated Verification**: Pytest test suite `test_phase5.py` passing 11/11 tests; Next.js frontend production build cleanly generating all 16 static routes.

---

*Built for Smart India Hackathon — SIH Problem Statement 19*
