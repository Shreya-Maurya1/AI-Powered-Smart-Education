from typing import List, Dict, Any, Optional
from app.memory.storage import memory_storage
from app.rag.embeddings import embedding_generator


class MemoryRetriever:
    """
    Retrieves and ranks relevant student memories (Working, Episodic, Semantic)
    to inject personalized context into agent prompts and LangGraph workflows.
    """

    def retrieve_context(
        self,
        student_id: str,
        topic: Optional[str] = None,
        query: Optional[str] = None,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """Retrieve top-k relevant memories for the student."""
        all_memories = memory_storage.fetch_all(student_id=student_id, limit=30)
        if not all_memories:
            return []

        search_text = f"{topic or ''} {query or ''}".strip().lower()
        if not search_text:
            return all_memories[:top_k]

        query_emb = embedding_generator.embed_query(search_text)

        scored_memories = []
        for mem in all_memories:
            content_emb = embedding_generator.embed_text(mem["content"])
            sim = embedding_generator.cosine_similarity(query_emb, content_emb)

            # Boost if topic matches directly
            topic_boost = 0.25 if (topic and mem.get("topic", "").lower() == topic.lower()) else 0.0
            # Weight by importance
            importance = mem.get("importance_score", 0.5)

            final_score = (sim * 0.45) + (importance * 0.35) + topic_boost
            scored_memories.append({
                **mem,
                "relevance_score": round(final_score, 3),
            })

        scored_memories.sort(key=lambda x: x["relevance_score"], reverse=True)
        return scored_memories[:top_k]

    def format_memory_for_prompt(self, memories: List[Dict[str, Any]]) -> str:
        """Format retrieved memories into a structured context block for LLM prompts."""
        if not memories:
            return "No prior student memory recorded for this topic."

        lines = ["--- Prior Student Memory Traces ---"]
        for m in memories:
            cat = m.get("category", "EPISODIC")
            content = m.get("content", "")
            topic = m.get("topic", "General")
            lines.append(f"• [{cat}] ({topic}): {content}")
        lines.append("-----------------------------------")
        return "\n".join(lines)


memory_retriever = MemoryRetriever()
