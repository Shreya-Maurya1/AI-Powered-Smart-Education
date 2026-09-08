# AdaptiveMind — AI-Powered Adaptive Smart Education Platform

> **Smart India Hackathon (SIH) — Problem Statement 19**  
> *An intelligent, data-driven education platform that dynamically understands student progress, computes topic mastery, tracks learning events, and delivers personalized learning paths.*

---

## 🏗️ Project Architecture

AdaptiveMind is structured as a decoupled monorepo containing a modern Next.js client, a high-performance Express/TypeScript backend, PostgreSQL relational database layer, and structured AI service stubs.

```
                  ┌─────────────────────────────────────────┐
                  │          Next.js 14 Web Client          │
                  │   (TypeScript, Tailwind CSS, Axios)    │
                  └────────────────────┬────────────────────┘
                                       │ HTTP / REST API
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Node.js + Express Backend         │
                  │      (TypeScript, Prisma ORM, JWT)     │
                  └───────┬─────────────────────────┬───────┘
                          │                         │
            Database SQL  │                         │ Trigger Engine
                          ▼                         ▼
            ┌───────────────────────────┐  ┌──────────────────────────────────┐
            │   PostgreSQL 16 Database  │  │    Deterministic Mastery Engine  │
            │  (Mastery, Events, Graphs)│  │ (Mastery Calc & Recommendation)  │
            └───────────────────────────┘  └──────────────────────────────────┘
```

### Layer Breakdown

1. **Frontend (`frontend/`)**: Next.js 14 App Router application providing dual user interfaces:
   - **Student Portal**: Course browser, lesson viewer, real-time quiz engine with countdown timer, deterministic topic mastery meters, recommended revision banner, and learning activity event stream.
   - **Teacher Portal**: Class performance analytics, student roster, topic weakness breakdown, and activity monitoring.
2. **Backend (`backend/`)**: RESTful API built with Express, TypeScript, and Prisma ORM. Provides JWT authentication, role guards, assessment grading, event emission, and mastery computation.
3. **Database (`database/`)**: PostgreSQL 16 schema featuring 15 relational tables, indexes, triggers, and migrations (`001_initial_schema.sql`, `002_seed_data.sql`, `003_phase2_mastery_and_dependencies.sql`).
4. **AI Service (`ai-service/`)**: Provider configuration stubs for **Groq**, **OpenAI**, **Ollama**, and **Google Gemini / Gemma 3 27B Cloud**.

---

## 📁 Monorepo Folder Architecture

```
adaptive-mind/
├── frontend/                     # Next.js 14 App Router Web Client
│   ├── src/
│   │   ├── app/                  # App Router pages (/login, /register, /dashboard, /courses, /learning, /assessment, /profile, /teacher/*)
│   │   ├── components/           # Navbar, Sidebar, ProtectedRoute, CourseCard, QuizQuestion, StatsCard
│   │   ├── hooks/                # useAuth, useCourses, useProgress
│   │   ├── lib/                  # Axios API client, auth storage helpers, utility functions
│   │   └── types/                # TypeScript interfaces (User, StudentMastery, MasterySummary, LearningEventItem)
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
│   │   ├── routes/               # Router endpoints (/api/auth, /api/courses, /api/assessments, /api/progress, /api/users)
│   │   ├── services/             # Business logic (authService, courseService, assessmentService, masteryService, progressService)
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
│       ├── 002_seed_data.sql      # Seed demo users, courses, questions, mastery & dependency graph
│       └── 003_phase2_mastery_and_dependencies.sql # Phase 2 database migration
│
├── ai-service/                   # AI Service Stubs & LLM Provider Configs
│   ├── providers/                # Groq, OpenAI, Ollama, Google Gemini / Gemma 3 27B typed configs
│   └── README.md
│
├── docs/                         # Documentation
├── docker-compose.yml            # Docker setup for PostgreSQL database
├── package.json                  # Root npm workspaces configuration
└── README.md                     # Root project documentation
```

---

## 🗺️ 6-Phase Roadmap

| Phase | Name | Description | Status |
|---|---|---|---|
| **1** | Core Web Foundation | Monorepo scaffold, JWT auth, courses, lessons, quiz interface, UI shell | ✅ **Complete** |
| **2** | Data Foundation & Mastery Engine | `student_mastery`, `learning_events`, `topic_dependencies`, deterministic mastery calculation formula, analytics dashboards | ✅ **Complete** |
| **3** | Adaptive Memory & Engine | Persistent student learning memory, knowledge graph traversal, personalized adaptive recommendations | ⏳ Planned |
| **4** | Multi-Agent System & LLM Integration | Autonomous learning agent, teacher co-pilot, question generator (Groq, Gemini, Gemma 3 27B) | ⏳ Planned |
| **5** | Multi-Modal Content & Real-Time Voice | Diagram analysis, video keyframe indexing, real-time voice explanation interface | ⏳ Planned |
| **6** | Production Hardening & Scaling | Load testing, security audit, CI/CD deployment pipelines, container orchestration | ⏳ Planned |

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

## 🚀 Setting Up & Running the Project

### Prerequisites
- **Node.js** $\ge 18.x$
- **npm** $\ge 9.x$
- **Docker & Docker Compose** (for PostgreSQL)

---

### Step 1: Install Dependencies

```bash
# Clone the repository
git clone <repo-url> adaptive-mind
cd adaptive-mind

# Install all monorepo dependencies
npm install
```

---

### Step 2: Start PostgreSQL Database

```bash
# Start PostgreSQL container via Docker Compose
npm run db:up

# Verify PostgreSQL is running on port 5432
docker ps
```

---

### Step 3: Run Database Migrations & Seed Data

```bash
cd backend

# Copy environment template
cp .env.example .env

# Generate Prisma Client & apply schema
npx prisma generate
npx prisma db push
```

*Optionally seed the database directly via SQL:*
```bash
docker exec -i adaptivemind_db psql -U adaptivemind -d adaptivemind_db < ../database/migrations/001_initial_schema.sql
docker exec -i adaptivemind_db psql -U adaptivemind -d adaptivemind_db < ../database/migrations/002_seed_data.sql
docker exec -i adaptivemind_db psql -U adaptivemind -d adaptivemind_db < ../database/migrations/003_phase2_mastery_and_dependencies.sql
```

---

### Step 4: Launch Backend API

```bash
# From backend directory
npm run dev

# API will start on http://localhost:5000
# Health check: http://localhost:5000/health
```

---

### Step 5: Launch Next.js Web Frontend

```bash
# In a new terminal tab, from frontend directory
cd frontend
npm run dev

# Frontend will start on http://localhost:3000
```

---

### 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Student** | `student@adaptivemind.dev` | `Student@123` |
| **Teacher** | `teacher@adaptivemind.dev` | `Teacher@123` |

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

---

*Built for Smart India Hackathon — SIH Problem Statement 19*
