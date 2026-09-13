from app.rag.retriever import PGVectorRetriever, rag_retriever

# Backwards compatibility aliases
CurriculumRetriever = PGVectorRetriever
retriever = rag_retriever

__all__ = ["PGVectorRetriever", "rag_retriever", "CurriculumRetriever", "retriever"]
