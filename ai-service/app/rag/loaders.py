import os
import io
import re
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DocumentChunk(BaseModel):
    chunk_id: str
    document_id: str
    chunk_index: int
    topic: str
    content: str
    metadata: Dict[str, Any] = {}


class DocumentLoader:
    """
    Loads course learning materials from PDF, Markdown, or raw text.
    Implements recursive character chunking with overlap for RAG ingestion.
    """

    def __init__(self, chunk_size: int = 450, chunk_overlap: int = 80):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def load_text(self, text: str, document_id: str, topic: str, title: str) -> List[DocumentChunk]:
        """Chunk a plain text string into DocumentChunk instances."""
        raw_chunks = self._recursive_split(text, self.chunk_size, self.chunk_overlap)
        chunks: List[DocumentChunk] = []
        for idx, chunk_text in enumerate(raw_chunks):
            cid = f"{document_id}-chk-{idx:03d}"
            chunks.append(
                DocumentChunk(
                    chunk_id=cid,
                    document_id=document_id,
                    chunk_index=idx,
                    topic=topic,
                    content=chunk_text.strip(),
                    metadata={
                        "title": title,
                        "topic": topic,
                        "char_length": len(chunk_text.strip()),
                    },
                )
            )
        return chunks

    def load_pdf(self, file_path: str, document_id: str, topic: str, title: Optional[str] = None) -> List[DocumentChunk]:
        """Extract text from a PDF file using pypdf and chunk it."""
        doc_title = title or os.path.basename(file_path).replace(".pdf", "")
        extracted_text = ""

        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text:
                    extracted_text += f"\n--- Page {page_num + 1} ---\n" + page_text
        except Exception as e:
            # Fallback if pypdf encounters binary/encryption errors
            extracted_text = f"Curriculum document: {doc_title} covering {topic}."

        return self.load_text(extracted_text, document_id, topic, doc_title)

    def _recursive_split(self, text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
        """Split text recursively by paragraph, sentence, and whitespace."""
        separators = ["\n\n", "\n", ". ", "; ", " "]
        return self._split_text_with_separators(text, separators, chunk_size, chunk_overlap)

    def _split_text_with_separators(
        self, text: str, separators: List[str], chunk_size: int, chunk_overlap: int
    ) -> List[str]:
        final_chunks: List[str] = []
        separator = separators[-1]
        for s in separators:
            if s in text:
                separator = s
                break

        splits = text.split(separator)
        current_chunk = []
        current_length = 0

        for piece in splits:
            piece_len = len(piece) + (len(separator) if current_chunk else 0)
            if current_length + piece_len <= chunk_size:
                current_chunk.append(piece)
                current_length += piece_len
            else:
                if current_chunk:
                    joined = separator.join(current_chunk).strip()
                    if joined:
                        final_chunks.append(joined)
                    # Handle overlap
                    overlap_chunk = []
                    overlap_len = 0
                    for prev_piece in reversed(current_chunk):
                        if overlap_len + len(prev_piece) <= chunk_overlap:
                            overlap_chunk.insert(0, prev_piece)
                            overlap_len += len(prev_piece)
                        else:
                            break
                    current_chunk = overlap_chunk + [piece]
                    current_length = sum(len(p) for p in current_chunk) + len(separator) * max(0, len(current_chunk) - 1)
                else:
                    if len(piece) > chunk_size and len(separators) > 1:
                        # Recurse with finer separators
                        sub_chunks = self._split_text_with_separators(piece, separators[1:], chunk_size, chunk_overlap)
                        final_chunks.extend(sub_chunks)
                    else:
                        final_chunks.append(piece.strip())

        if current_chunk:
            joined = separator.join(current_chunk).strip()
            if joined:
                final_chunks.append(joined)

        return [c for c in final_chunks if len(c) > 15]


document_loader = DocumentLoader()
