-- ============================================================
-- AdaptiveMind Database Schema
-- SIH Problem 19 — Adaptive Smart Education Platform
-- Phase 1: Core tables (no AI/embeddings/recommendations yet)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMs
-- ============================================================

CREATE TYPE user_role AS ENUM ('STUDENT', 'TEACHER');
CREATE TYPE content_type AS ENUM ('TEXT', 'VIDEO', 'INTERACTIVE');
CREATE TYPE assessment_type AS ENUM ('QUIZ', 'TEST', 'PRACTICE');
CREATE TYPE question_type AS ENUM ('MCQ', 'TRUE_FALSE', 'SHORT_ANSWER');
CREATE TYPE event_type AS ENUM (
  'LESSON_START',
  'LESSON_COMPLETE',
  'TOPIC_VIEW',
  'ASSESSMENT_START',
  'ASSESSMENT_COMPLETE'
);

-- ============================================================
-- CORE USER TABLES
-- ============================================================

CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          user_role NOT NULL DEFAULT 'STUDENT',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role  ON users(role);

-- ============================================================

CREATE TABLE students (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id        TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grade          VARCHAR(50) NOT NULL DEFAULT '10',
  learning_style VARCHAR(50),                  -- visual, auditory, kinesthetic, reading
  xp_points      INTEGER NOT NULL DEFAULT 0,
  streak_days    INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_students_user_id ON students(user_id);

-- ============================================================

CREATE TABLE teachers (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department    VARCHAR(255) NOT NULL DEFAULT 'General',
  qualification VARCHAR(255) NOT NULL DEFAULT 'B.Ed',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_teachers_user_id ON teachers(user_id);

-- ============================================================
-- COURSE STRUCTURE
-- ============================================================

CREATE TABLE courses (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title        VARCHAR(500) NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  thumbnail_url TEXT,
  subject_area VARCHAR(100) NOT NULL,
  grade_level  VARCHAR(50) NOT NULL,
  teacher_id   TEXT NOT NULL REFERENCES teachers(id) ON DELETE RESTRICT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courses_teacher_id   ON courses(teacher_id);
CREATE INDEX idx_courses_subject_area ON courses(subject_area);
CREATE INDEX idx_courses_grade_level  ON courses(grade_level);
CREATE INDEX idx_courses_is_published ON courses(is_published);

-- ============================================================

CREATE TABLE modules (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id   TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_modules_course_id   ON modules(course_id);
CREATE INDEX idx_modules_order_index ON modules(course_id, order_index);

-- ============================================================

CREATE TABLE lessons (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  module_id        TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title            VARCHAR(500) NOT NULL,
  content          TEXT NOT NULL DEFAULT '',
  content_type     content_type NOT NULL DEFAULT 'TEXT',
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  order_index      INTEGER NOT NULL DEFAULT 0,
  is_published     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_module_id   ON lessons(module_id);
CREATE INDEX idx_lessons_order_index ON lessons(module_id, order_index);

-- ============================================================

CREATE TABLE topics (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  lesson_id   TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title       VARCHAR(500) NOT NULL,
  summary     TEXT NOT NULL DEFAULT '',
  key_points  JSONB NOT NULL DEFAULT '[]',  -- string[]
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topics_lesson_id   ON topics(lesson_id);
CREATE INDEX idx_topics_order_index ON topics(lesson_id, order_index);

-- ============================================================
-- ASSESSMENTS
-- ============================================================

CREATE TABLE assessments (
  id                 TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  course_id          TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id          TEXT REFERENCES lessons(id) ON DELETE SET NULL,
  title              VARCHAR(500) NOT NULL,
  type               assessment_type NOT NULL DEFAULT 'QUIZ',
  total_marks        INTEGER NOT NULL DEFAULT 0,
  passing_marks      INTEGER NOT NULL DEFAULT 0,
  time_limit_minutes INTEGER NOT NULL DEFAULT 30,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessments_course_id ON assessments(course_id);
CREATE INDEX idx_assessments_lesson_id ON assessments(lesson_id);

-- ============================================================

CREATE TABLE questions (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  assessment_id  TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  question_type  question_type NOT NULL DEFAULT 'MCQ',
  options        JSONB NOT NULL DEFAULT '[]',  -- string[] for MCQ options
  correct_answer TEXT NOT NULL,
  points         INTEGER NOT NULL DEFAULT 1,
  order_index    INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_assessment_id ON questions(assessment_id);
CREATE INDEX idx_questions_order_index   ON questions(assessment_id, order_index);

-- ============================================================

CREATE TABLE answers (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  question_id   TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text   TEXT NOT NULL,
  explanation   TEXT,
  is_correct    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_answers_question_id ON answers(question_id);

-- ============================================================
-- STUDENT ACTIVITY
-- ============================================================

CREATE TABLE student_courses (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id        TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  progress_percent FLOAT NOT NULL DEFAULT 0,
  UNIQUE (student_id, course_id)
);

CREATE INDEX idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX idx_student_courses_course_id  ON student_courses(course_id);

-- ============================================================

CREATE TABLE attempts (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id        TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  assessment_id     TEXT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  answers           JSONB NOT NULL DEFAULT '{}',   -- { questionId: answerText }
  score             INTEGER NOT NULL DEFAULT 0,
  total_possible    INTEGER NOT NULL DEFAULT 0,
  passed            BOOLEAN NOT NULL DEFAULT FALSE,
  started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  time_taken_seconds INTEGER
);

CREATE INDEX idx_attempts_student_id    ON attempts(student_id);
CREATE INDEX idx_attempts_assessment_id ON attempts(assessment_id);
CREATE INDEX idx_attempts_started_at    ON attempts(started_at DESC);

-- ============================================================

CREATE TABLE learning_events (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id  TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  metadata   JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_events_student_id ON learning_events(student_id);
CREATE INDEX idx_learning_events_lesson_id  ON learning_events(lesson_id);
CREATE INDEX idx_learning_events_created_at ON learning_events(created_at DESC);
CREATE INDEX idx_learning_events_event_type ON learning_events(event_type);

-- ============================================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at   BEFORE UPDATE ON users   FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- VIEWS (helpful for queries)
-- ============================================================

CREATE VIEW student_progress_summary AS
SELECT
  s.id AS student_id,
  u.name AS student_name,
  u.email,
  s.grade,
  s.xp_points,
  s.streak_days,
  COUNT(DISTINCT sc.course_id)  AS enrolled_courses,
  COALESCE(AVG(sc.progress_percent), 0) AS avg_progress_percent,
  COUNT(DISTINCT a.id) FILTER (WHERE a.passed = TRUE) AS passed_assessments,
  COALESCE(AVG(a.score::float / NULLIF(a.total_possible, 0) * 100), 0) AS avg_score_percent
FROM students s
JOIN users u ON u.id = s.user_id
LEFT JOIN student_courses sc ON sc.student_id = s.id
LEFT JOIN attempts a ON a.student_id = s.id AND a.completed_at IS NOT NULL
GROUP BY s.id, u.name, u.email, s.grade, s.xp_points, s.streak_days;

-- ============================================================
-- Phase 2+ tables (NOT created here — listed for reference):
-- mastery_scores, knowledge_nodes, embeddings, recommendations,
-- memory_traces, learning_paths, adaptive_rules
-- ============================================================
