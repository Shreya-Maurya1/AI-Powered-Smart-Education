-- ============================================================================
-- Migration 004: Phase 5 RAG Pipeline & Student Memory System
-- Description: Enables pgvector, creates rag_documents, rag_document_chunks,
--              and student_memories tables with seed curriculum knowledge.
-- ============================================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. RAG Documents Table
CREATE TABLE IF NOT EXISTS rag_documents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    topic VARCHAR(100) NOT NULL,
    content_type VARCHAR(50) DEFAULT 'TEXT',
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RAG Document Chunks with Vector Embeddings (384 dimensions)
CREATE TABLE IF NOT EXISTS rag_document_chunks (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) REFERENCES rag_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_chunks_doc ON rag_document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_rag_chunks_topic ON rag_document_chunks(topic);

-- 4. Student Memory Table (Episodic, Semantic, Working)
CREATE TABLE IF NOT EXISTS student_memories (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL,
    category VARCHAR(32) NOT NULL, -- 'WORKING', 'EPISODIC', 'SEMANTIC'
    content TEXT NOT NULL,
    topic VARCHAR(100),
    importance_score FLOAT DEFAULT 0.5,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_memories_student ON student_memories(student_id);
CREATE INDEX IF NOT EXISTS idx_student_memories_cat ON student_memories(category);
CREATE INDEX IF NOT EXISTS idx_student_memories_topic ON student_memories(topic);

-- 5. Seed Core RAG Documents for Curriculum Topics
INSERT INTO rag_documents (id, title, topic, content_type) VALUES
('doc-rec-01', 'Mastering Recursion in Python: Call Stacks & Base Conditions', 'Python Recursion', 'TEXT'),
('doc-func-01', 'Python Functions, Scope, and First-Class Citizens', 'Python Functions', 'TEXT'),
('doc-var-01', 'Python Memory Model, Variables, and Mutable References', 'Python Variables', 'TEXT'),
('doc-sql-01', 'Relational Database Joins: INNER, LEFT, RIGHT, and FULL OUTER', 'SQL JOIN', 'TEXT')
ON CONFLICT (id) DO NOTHING;

-- Initial memory seeds for demo student
INSERT INTO student_memories (id, student_id, category, content, topic, importance_score, metadata) VALUES
('mem-01', 'cmtt5drap00021dekmkdu4xt4', 'EPISODIC', 'Student struggled with recursion termination condition on practice quiz #3.', 'Python Recursion', 0.85, '{"source": "quiz_attempt", "error_type": "infinite_recursion"}'),
('mem-02', 'cmtt5drap00021dekmkdu4xt4', 'SEMANTIC', 'Prefers step-by-step visual call stack traces when explaining recursive branches.', 'Python Recursion', 0.90, '{"learning_style": "visual"}'),
('mem-03', 'cmtt5drap00021dekmkdu4xt4', 'SEMANTIC', 'Comfortable with basic function definitions, return statements, and variable scoping.', 'Python Functions', 0.70, '{"strength": "syntax"}'),
('mem-04', 'student-1', 'EPISODIC', 'Failed recursion base condition quiz with repeated wrong attempts.', 'Python Recursion', 0.88, '{"attempts": 3}'),
('mem-05', 'student-1', 'SEMANTIC', 'Needs intuitive analogies like Russian nesting dolls or call stack frames.', 'Python Recursion', 0.80, '{"pedagogy": "analogy"}')
ON CONFLICT (id) DO NOTHING;
