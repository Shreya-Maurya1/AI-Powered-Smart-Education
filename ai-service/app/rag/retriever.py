import json
import logging
from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

from app.config import settings
from app.rag.embeddings import embedding_generator
from app.rag.loaders import document_loader

logger = logging.getLogger("adaptivemind.rag.retriever")

# Seed curriculum textbooks for cold starts / fallback
SEED_CURRICULUM_DATA = [
    {
        "document_id": "doc-rec-01",
        "title": "Mastering Recursion in Python: Call Stacks & Base Conditions",
        "topic": "Python Recursion",
        "content": (
            "A recursive function in Python consists of two mandatory components: "
            "1. The Base Condition (or Termination Condition): A non-recursive conditional branch that stops execution "
            "and returns an explicit value without making any further recursive invocations. Without a proper base condition, "
            "Python raises 'RecursionError: maximum recursion depth exceeded in comparison'. "
            "2. The Recursive Step (Reduction): The function calls itself with modified arguments that strictly move "
            "closer to the base condition. Every recursive invocation allocates a new frame on the system call stack, "
            "preserving local variable states until child frames return."
        ),
    },
    {
        "document_id": "doc-rec-01",
        "title": "Mastering Recursion in Python: Call Stacks & Base Conditions",
        "topic": "Python Recursion",
        "content": (
            "Call Stack Mechanics in Recursion: When def factorial(n) is invoked with n=3: "
            "factorial(3) calls factorial(2), which calls factorial(1). "
            "When n=1 satisfies 'if n <= 1: return 1', the base case returns 1 to the factorial(2) frame. "
            "factorial(2) then computes 2 * 1 = 2 and returns to the factorial(3) frame. "
            "Finally, factorial(3) computes 3 * 2 = 6. "
            "To debug infinite recursion, ensure the reduction argument decrements (or increments toward the limit) "
            "and that edge inputs (like negative numbers or zero) are trapped in the base case."
        ),
    },
    {
        "document_id": "doc-func-01",
        "title": "Python Functions, Scope, and First-Class Citizens",
        "topic": "Python Functions",
        "content": (
            "Python functions are defined using the 'def' keyword and are first-class objects, meaning they can be "
            "assigned to variables, passed as arguments, and returned from other functions. "
            "Variable resolution adheres strictly to the LEGB Rule: "
            "L (Local): Names assigned inside a function body. "
            "E (Enclosing): Names in local scopes of enclosing/nested functions. "
            "G (Global): Names assigned at the top-level of the module. "
            "B (Built-in): Predefined names in the Python builtins module (e.g., len, range, print)."
        ),
    },
    {
        "document_id": "doc-var-01",
        "title": "Python Memory Model, Variables, and Mutable References",
        "topic": "Python Variables",
        "content": (
            "In Python, variables are not memory containers; they are reference tags pointing to objects in heap memory. "
            "Primitive types like int, float, str, and tuple are immutable. Modifying an integer creates a new object "
            "and rebinds the variable name. Conversely, lists, dictionaries, and sets are mutable. "
            "Assigning list_b = list_a does not copy the elements; it points list_b to the exact same memory address. "
            "Use copy.deepcopy() or list_a.copy() when independent mutations are required."
        ),
    },
    {
        "document_id": "doc-sql-01",
        "title": "Relational Database Joins: INNER, LEFT, RIGHT, and FULL OUTER",
        "topic": "SQL JOIN",
        "content": (
            "SQL JOIN clauses combine rows from two or more tables based on a related column between them: "
            "1. INNER JOIN: Returns records that have matching values in both tables (intersection). "
            "2. LEFT (OUTER) JOIN: Returns all records from the left table, plus matched records from the right table. "
            "If no match exists on the right, NULL values are populated for the right columns. "
            "3. RIGHT (OUTER) JOIN: Returns all records from the right table, plus matched records from the left table. "
            "4. FULL OUTER JOIN: Returns all records when there is a match in either left or right table. "
            "Always specify join conditions with the ON keyword (e.g., 'ON orders.customer_id = customers.id')."
        ),
    },
]


class PGVectorRetriever:
    """
    RAG Retriever querying PostgreSQL vector database or in-memory fallback.
    Utilizes 384-d cosine similarity embeddings to retrieve relevant chunks with source citations.
    """

    def __init__(self):
        self._memory_chunks: List[Dict[str, Any]] = []
        self._init_memory_chunks()
        self._sync_to_postgres()

    def _get_db_connection(self):
        try:
            conn = psycopg2.connect(
                dbname=settings.DB_NAME,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                connect_timeout=3,
            )
            return conn
        except Exception as e:
            logger.warning(f"Could not connect to PostgreSQL: {e}. Utilizing cached RAG index.")
            return None

    def _init_memory_chunks(self):
        """Prepare vectorized chunks in memory."""
        for item in SEED_CURRICULUM_DATA:
            chunks = document_loader.load_text(
                text=item["content"],
                document_id=item["document_id"],
                topic=item["topic"],
                title=item["title"],
            )
            for c in chunks:
                emb = embedding_generator.embed_text(c.content)
                self._memory_chunks.append({
                    "chunk_id": c.chunk_id,
                    "document_id": c.document_id,
                    "title": item["title"],
                    "topic": c.topic,
                    "content": c.content,
                    "embedding": emb,
                })

    def _sync_to_postgres(self):
        """Persist seed chunks into PostgreSQL rag_document_chunks if connected."""
        conn = self._get_db_connection()
        if not conn:
            return
        try:
            with conn.cursor() as cur:
                for c in self._memory_chunks:
                    emb_str = "[" + ",".join(str(x) for x in c["embedding"]) + "]"
                    meta_json = json.dumps({"title": c["title"], "topic": c["topic"]})
                    cur.execute(
                        """
                        INSERT INTO rag_document_chunks (id, document_id, chunk_index, topic, content, embedding, metadata)
                        VALUES (%s, %s, %s, %s, %s, %s::vector, %s)
                        ON CONFLICT (id) DO UPDATE 
                        SET content = EXCLUDED.content, embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata;
                        """,
                        (c["chunk_id"], c["document_id"], 0, c["topic"], c["content"], emb_str, meta_json),
                    )
                conn.commit()
                logger.info(f"Synchronized {len(self._memory_chunks)} RAG chunks into PostgreSQL.")
        except Exception as e:
            logger.warning(f"Failed to sync chunks to PostgreSQL: {e}")
        finally:
            conn.close()

    def retrieve(self, query: str, topic: Optional[str] = None, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Retrieve top-k relevant chunks for a user query.
        Tries PostgreSQL pgvector first; falls back cleanly to cosine similarity over memory chunks.
        """
        query_emb = embedding_generator.embed_query(query)
        results = []

        # 1. Try PostgreSQL pgvector search
        conn = self._get_db_connection()
        if conn:
            try:
                emb_str = "[" + ",".join(str(x) for x in query_emb) + "]"
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    if topic:
                        cur.execute(
                            """
                            SELECT id, document_id, topic, content, metadata,
                                   1 - (embedding <=> %s::vector) AS similarity
                            FROM rag_document_chunks
                            WHERE LOWER(topic) = LOWER(%s)
                            ORDER BY embedding <=> %s::vector
                            LIMIT %s;
                            """,
                            (emb_str, topic, emb_str, top_k),
                        )
                    else:
                        cur.execute(
                            """
                            SELECT id, document_id, topic, content, metadata,
                                   1 - (embedding <=> %s::vector) AS similarity
                            FROM rag_document_chunks
                            ORDER BY embedding <=> %s::vector
                            LIMIT %s;
                            """,
                            (emb_str, emb_str, top_k),
                        )
                    rows = cur.fetchall()
                    for r in rows:
                        meta = r["metadata"] if isinstance(r["metadata"], dict) else {}
                        results.append({
                            "chunk_id": r["id"],
                            "document_id": r["document_id"],
                            "title": meta.get("title", r["topic"]),
                            "topic": r["topic"],
                            "content": r["content"],
                            "similarity": round(float(r["similarity"]), 3),
                        })
            except Exception as e:
                logger.warning(f"pgvector query error: {e}. Falling back to in-memory cosine index.")
                results = []
            finally:
                conn.close()

        # 2. In-memory cosine fallback if DB empty or unavailable
        if not results:
            candidates = self._memory_chunks
            if topic:
                candidates = [c for c in candidates if c["topic"].lower() == topic.lower()] or self._memory_chunks

            scored = []
            for c in candidates:
                sim = embedding_generator.cosine_similarity(query_emb, c["embedding"])
                scored.append({
                    "chunk_id": c["chunk_id"],
                    "document_id": c["document_id"],
                    "title": c["title"],
                    "topic": c["topic"],
                    "content": c["content"],
                    "similarity": round(sim, 3),
                })

            scored.sort(key=lambda x: x["similarity"], reverse=True)
            results = scored[:top_k]

        return results

    def format_citations(self, chunks: List[Dict[str, Any]]) -> str:
        """Format retrieved chunks into a clean markdown citation block."""
        if not chunks:
            return ""
        lines = ["\n\n### 📚 Referenced Curriculum Sources:"]
        for idx, c in enumerate(chunks, 1):
            source = c.get("title") or c.get("topic")
            similarity = int(c.get("similarity", 0.0) * 100)
            lines.append(f"- **[{idx}] {source}** (Relevance: {similarity}%)")
            # Extract first 120 chars as snippet
            snippet = c.get("content", "").replace("\n", " ")[:140] + "..."
            lines.append(f"  > *\"{snippet}\"*")
        return "\n".join(lines)


# Singleton RAG retriever
rag_retriever = PGVectorRetriever()
