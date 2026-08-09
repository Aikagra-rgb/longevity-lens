import numpy as np
from typing import List
import hashlib
from backend.config import EMBEDDING_MODEL

class EmbeddingService:
    """
    Service for generating embeddings using Google Gemini text-embedding-004.
    Uses the new google-genai SDK (v1+).
    Falls back gracefully to deterministic local hash vectors if no API key.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = EMBEDDING_MODEL
        self._client = None
        if api_key and not api_key.startswith("your-"):
            try:
                from google import genai
                self._client = genai.Client(api_key=api_key)
            except Exception as e:
                print(f"[EmbeddingService] Could not initialise Gemini client: {e}")
                self._client = None

    def _fallback_embed(self, text: str) -> List[float]:
        """
        768-dimensional deterministic normalized vector (matches text-embedding-004 dims).
        Used when no API key or quota exceeded.
        """
        words = text.lower().split()
        vec = np.zeros(3072, dtype=np.float32)
        for word in words:
            h = hashlib.sha256(word.encode('utf-8')).digest()
            for i in range(0, min(len(h), 16), 2):
                idx = (h[i] * 256 + h[i+1]) % 3072
                val = ((h[(i+2) % len(h)] / 255.0) * 2.0) - 1.0
                vec[idx] += val
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_text(self, text: str) -> List[float]:
        if self._client:
            try:
                result = self._client.models.embed_content(
                    model=self.model,
                    contents=text,
                )
                return result.embeddings[0].values
            except Exception as e:
                print(f"[EmbeddingService] Gemini embed fallback: {e}")
                return self._fallback_embed(text)
        return self._fallback_embed(text)

    def embed_query(self, text: str) -> List[float]:
        """Alias for embed_text — used for query embedding."""
        return self.embed_text(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        if self._client:
            try:
                results = []
                for text in texts:
                    result = self._client.models.embed_content(
                        model=self.model,
                        contents=text,
                    )
                    results.append(result.embeddings[0].values)
                return results
            except Exception as e:
                print(f"[EmbeddingService] Gemini batch embed fallback: {e}")
                return [self._fallback_embed(t) for t in texts]
        return [self._fallback_embed(t) for t in texts]
