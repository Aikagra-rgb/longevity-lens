import fitz  # PyMuPDF
import re
from typing import List, Dict, Any
from datetime import datetime
from backend.config import CHUNK_SIZE, CHUNK_OVERLAP
import uuid

class DocumentParser:
    """
    DocumentParser class for parsing and chunking documents.
    """
    
    def parse_pdf(self, file_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Parse PDF and return extracted text with page numbers.
        """
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = []
        for i, page in enumerate(doc):
            text = page.get_text()
            pages.append({
                "page_number": i + 1,
                "text": text
            })
        return pages

    def parse_text(self, text: str, source_name: str) -> List[Dict[str, Any]]:
        """
        Parse text and return extracted text with page numbers (simulated as 1 page).
        """
        return [{"page_number": 1, "text": text}]

    def _detect_section(self, text_chunk: str) -> str:
        """
        Simple section-aware chunking based on common headers.
        """
        headers = ["Abstract", "Introduction", "Methods", "Results", "Discussion", "Conclusion"]
        
        # Simple heuristic: look for headers at the start or prominently in the text
        text_lower = text_chunk.lower()
        
        for header in headers:
            if header.lower() in text_lower[:200]:
                return header
                
        return "Body"

    def chunk_text(self, text: str, source_name: str, base_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Chunk text into smaller pieces with overlap.
        """
        chunks = []
        
        # Very simple chunking
        start = 0
        text_len = len(text)
        chunk_index = 0
        
        uploaded_at = datetime.utcnow().isoformat()
        
        while start < text_len:
            end = start + CHUNK_SIZE
            chunk_text = text[start:end]
            
            section = self._detect_section(chunk_text)
            
            metadata = base_metadata.copy()
            metadata.update({
                "source": source_name,
                "section": section,
                "chunk_index": chunk_index,
                "uploaded_at": uploaded_at
            })
            
            chunks.append({
                "id": str(uuid.uuid4()),
                "text": chunk_text,
                "metadata": metadata
            })
            
            start += (CHUNK_SIZE - CHUNK_OVERLAP)
            chunk_index += 1
            
        return chunks
