import numpy as np
from typing import List
import hashlib
from backend.config import EMBEDDING_MODEL

class EmbeddingService:
    """
    Service for generating embeddings using Google Gemini text-embedding-004.
    Falls back gracefully to deterministic local hash vectors if no API key
    or if quota is exceeded — app stays 100% functional in offline/fallback mode.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = EMBEDDING_MODEL
        self._client = None
        if api_key and not api_key.startswith("your-"):
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self._client = genai
            except Exception as e:
                print(f"[EmbeddingService] Could not initialise Gemini client: {e}")
                self._client = None

    def _fallback_embed(self, text: str) -> List[float]:
        """
        Generate a deterministic 768-dimensional normalized vector based on word hashes.
        Matches Gemini text-embedding-004 output dimensions (768).
        Ensures search & indexing work without a live API key.
        """
        words = text.lower().split()
        vec = np.zeros(768, dtype=np.float32)
        for word in words:
            h = hashlib.sha256(word.encode('utf-8')).digest()
            for i in range(0, min(len(h), 16), 2):
                idx = (h[i] * 256 + h[i+1]) % 768
                val = ((h[(i+2) % len(h)] / 255.0) * 2.0) - 1.0
                vec[idx] += val
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_text(self, text: str) -> List[float]:
        """Embed a single text string using Gemini embedding API."""
        if self._client:
            try:
                result = self._client.embed_content(
                    model=self.model,
                    content=text,
                    task_type="retrieval_document"
                )
                return result['embedding']
            except Exception as e:
                print(f"[EmbeddingService] Gemini embedding fallback due to: {e}")
                return self._fallback_embed(text)
        return self._fallback_embed(text)

    def embed_query(self, text: str) -> List[float]:
        """Embed a query string (uses retrieval_query task type for better recall)."""
        if self._client:
            try:
                result = self._client.embed_content(
                    model=self.model,
                    content=text,
                    task_type="retrieval_query"
                )
                return result['embedding']
            except Exception as e:
                print(f"[EmbeddingService] Gemini query embedding fallback due to: {e}")
                return self._fallback_embed(text)
        return self._fallback_embed(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of text strings."""
        if not texts:
            return []
        if self._client:
            try:
                results = []
                # Gemini embed_content doesn't support bulk batching — call per item
                for text in texts:
                    result = self._client.embed_content(
                        model=self.model,
                        content=text,
                        task_type="retrieval_document"
                    )
                    results.append(result['embedding'])
                return results
            except Exception as e:
                print(f"[EmbeddingService] Gemini batch embedding fallback due to: {e}")
                return [self._fallback_embed(t) for t in texts]
        return [self._fallback_embed(t) for t in texts]
