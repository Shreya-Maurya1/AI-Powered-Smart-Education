-- ============================================================
-- Migration 003: Phase 2 Student Mastery, Topic Dependencies & Expanded Events
-- AdaptiveMind — Phase 2
-- Date: 2026-09-09
-- ============================================================

BEGIN;

-- Expand event_type ENUM
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'LESSON_COMPLETED';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'QUIZ_ATTEMPTED';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'QUESTION_WRONG';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'QUESTION_CORRECT';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'TOPIC_REVISED';
ALTER TYPE event_type ADD VALUE IF NOT EXISTS 'CODING_ATTEMPT';

-- Make lesson_id optional in learning_events and add topic column
ALTER TABLE learning_events ALTER COLUMN lesson_id DROP NOT NULL;
ALTER TABLE learning_events ADD COLUMN IF NOT EXISTS topic VARCHAR(255);

-- Add topic column to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic VARCHAR(255);

-- ============================================================
-- STUDENT MASTERY TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS student_mastery (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  student_id    TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  topic         VARCHAR(255) NOT NULL,
  mastery_score FLOAT NOT NULL DEFAULT 0.0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, topic)
);

CREATE INDEX IF NOT EXISTS idx_student_mastery_student ON student_mastery(student_id);
CREATE INDEX IF NOT EXISTS idx_student_mastery_topic   ON student_mastery(topic);

-- ============================================================
-- TOPIC DEPENDENCIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS topic_dependencies (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  topic               VARCHAR(255) NOT NULL,
  prerequisite_topic VARCHAR(255) NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (topic, prerequisite_topic)
);

CREATE INDEX IF NOT EXISTS idx_topic_deps_topic ON topic_dependencies(topic);
CREATE INDEX IF NOT EXISTS idx_topic_deps_prereq ON topic_dependencies(prerequisite_topic);

COMMIT;
