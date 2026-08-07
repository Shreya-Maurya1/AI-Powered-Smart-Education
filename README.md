# AdaptiveMind

> **AI-Powered Adaptive Smart Education Platform** — SIH Problem Statement 19

## Overview

AdaptiveMind is a full-stack adaptive learning platform built for the Smart India Hackathon (SIH) Problem 19. It delivers a personalized education experience by tracking each student's learning patterns, identifying knowledge gaps, and dynamically adjusting the difficulty and sequencing of content. The platform supports two roles — Students and Teachers — with separate dashboards: students navigate their learning path, take assessments, and receive AI-driven feedback; teachers monitor class-wide progress, analyze performance trends, and manage course content. Phase 1 establishes the complete core infrastructure (authentication, course management, lesson delivery, assessments, and progress tracking) without any AI logic, providing a solid, production-ready foundation for the adaptive AI layers that follow in Phases 2–6.

---

## 6-Phase Roadmap

| Phase | Name | Description | Status |
|---|---|---|---|
| **1** | Core Platform | Monorepo, auth, courses, assessments, progress tracking | ✅ **Complete** |
| **2** | LLM Integration | Multi-provider AI (Groq, OpenAI, Ollama, Gemma), knowledge graph, basic recommendations | ⏳ Planned |
| **3** | Adaptive Engine | Memory system, multi-agent orchestration, personalized learning paths | ⏳ Planned |
| **4** | Analytics & Feedback | A/B testing, detailed analytics, real-time feedback loops, teacher insights | ⏳ Planned |
| **5** | Multi-modal & Voice | Image/diagram analysis, voice interface, interactive simulations | ⏳ Planned |
| **6** | Production Hardening | Deployment pipeline, monitoring, load testing, security audit | ⏳ Planned |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Query, Axios |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM, JWT, Zod, bcryptjs, Morgan, express-rate-limit |
| **Database** | PostgreSQL 16, Docker-managed locally |
| **AI Service** | Placeholder — Python/FastAPI planned (Phase 2) |
| **LLM Providers** | Groq, OpenAI, Ollama, Google Gemini/Gemma 3 27B (Phase 2+) |
| **DevOps** | Docker Compose, npm workspaces, ts-node-dev |

---

## How to Run Locally

### Prerequisites

- **Node.js** ≥ 18.x (`node -v`)
- **npm** ≥ 9.x (`npm -v`)
- **Docker Desktop** (for PostgreSQL) — [download](https://www.docker.com/products/docker-desktop/)
- **Git**

---

### 1. Clone & Install

```bash
git clone <repo-url> adaptive-mind
cd adaptive-mind
npm install          # installs root + all workspaces
```

---

### 2. Start the Database

```bash
# Start PostgreSQL via Docker
npm run db:up

# Wait ~10s for it to become healthy, then verify:
docker logs adaptivemind_db
```

The database will auto-run migrations from `database/migrations/` on first start.

---

### 3. Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` — the defaults work with Docker Compose out of the box:

```env
DATABASE_URL="postgresql://adaptivemind:password@localhost:5432/adaptivemind_db"
JWT_SECRET="change-this-secret-in-production"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

Then run Prisma migrations:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma generate
```

---

### 4. Start the Backend

```bash
# From backend/ directory:
npm run dev

# Or from monorepo root:
npm run dev:backend
```

Backend runs at: **http://localhost:5000**  
Health check: **http://localhost:5000/health**

---

### 5. Configure & Start the Frontend

```bash
cd frontend
# .env.local is already pre-configured:
# NEXT_PUBLIC_API_URL=http://localhost:5000

npm install
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

### 6. Full Stack with Docker (Optional)

```bash
# From monorepo root — starts everything:
npm run docker:up

# Stop:
npm run docker:down
```

---

### Demo Accounts

Use `/register` to create your own accounts, or use the seeded demo credentials:

| Role | Email | Password |
|---|---|---|
| Teacher | `teacher@adaptivemind.dev` | `Teacher@123` |
| Student | `student@adaptivemind.dev` | `Student@123` |

> **Note**: Demo password hashes in seed data are placeholders. Register via the API for real credentials.

---

## API Reference (Key Endpoints)

```
POST   /api/auth/register        — Register student or teacher
POST   /api/auth/login           — Login, returns JWT
GET    /api/auth/me              — Current user (authenticated)

GET    /api/courses              — List all published courses
GET    /api/courses/:id          — Course detail with modules & lessons
POST   /api/courses/:id/enroll   — Enroll in a course
GET    /api/courses/enrolled     — Student's enrolled courses

GET    /api/assessments/:id      — Assessment with questions
POST   /api/assessments/submit   — Submit quiz attempt
GET    /api/assessments/attempts — Student's attempt history

GET    /api/progress/students/:id           — Overall student progress
GET    /api/progress/students/:id/courses/:courseId — Course progress
POST   /api/progress/events      — Log learning event

GET    /api/users/me             — Profile
PUT    /api/users/me             — Update profile
GET    /api/users/students       — All students (teacher only)
```

---

## Folder Structure (Phase 1)

```
adaptive-mind/
├── frontend/               ← Next.js 14 + TypeScript + Tailwind
│   └── src/
│       ├── app/            ← App Router pages (login, register, dashboard, ...)
│       ├── components/     ← Layout, UI, shared components
│       ├── hooks/          ← useAuth, useCourses, useProgress
│       ├── lib/            ← API client, auth utils, helpers
│       └── types/          ← TypeScript interfaces
│
├── backend/                ← Express + TypeScript + Prisma
│   ├── prisma/             ← Schema + Prisma client
│   └── src/
│       ├── config/         ← env, database, jwt config
│       ├── controllers/    ← Request handlers
│       ├── middleware/     ← Auth, roleGuard, errorHandler
│       ├── models/         ← Type definitions
│       ├── routes/         ← Express routers
│       ├── services/       ← Business logic
│       └── utils/          ← JWT, bcrypt, response helpers
│
├── ai-service/             ← Phase 2+ placeholder
│   └── providers/          ← LLM config stubs (Groq, OpenAI, Ollama, Gemini/Gemma)
│
├── database/
│   ├── schema/schema.sql   ← Full PostgreSQL schema reference
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_seed_data.sql
│
├── docs/                   ← Documentation
├── debugging/              ← Debug scripts & logs
├── docker-compose.yml      ← Local dev environment
├── package.json            ← npm workspaces root
└── README.md
```

---

## Progress Log

### 2026-08-08 — Phase 1 Complete ✅

**What was built:**

- **Monorepo scaffold** — npm workspaces, Git init, `.gitignore`, `docker-compose.yml`
- **Database** — Full PostgreSQL schema (13 tables: users, students, teachers, courses, modules, lessons, topics, assessments, questions, answers, attempts, learning\_events, student\_courses), indexes, enums, triggers, and a progress summary view. Migrations + seed data with 2 demo courses, 5-question quiz, and demo accounts.
- **Backend** — Express + TypeScript + Prisma ORM with complete auth (JWT + bcrypt), CRUD for courses/modules/lessons/topics, assessment grading engine, progress tracking, and learning event logging. Rate limiting, CORS, global error handling (Prisma + Zod + JWT errors), and graceful shutdown.
- **Frontend** — Next.js 14 App Router with 11 pages: login, register, student dashboard, course browser, course detail, lesson viewer, assessment/quiz interface with timer, student profile, teacher dashboard, student management, and analytics. Axios API client with JWT interceptors, Zustand/localStorage auth state, and React Query for data fetching.
- **AI Service** — Placeholder with full typed LLM provider configs for **Groq** (Llama 3.1 70B, Mixtral), **OpenAI** (GPT-4o, embeddings), **Ollama** (local LLMs, privacy mode), and **Google Gemini/Gemma 3 27B** (cloud via Vertex AI + AI Studio).
- **Acceptance criteria met** — A student can register → log in → browse a course → complete a lesson → take a quiz → see result reflected in progress.

---

*Built for Smart India Hackathon — SIH Problem Statement 19: Adaptive Smart Education Platform*
