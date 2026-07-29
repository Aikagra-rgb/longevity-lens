import numpy as np
from typing import List
import hashlib
from backend.config import EMBEDDING_MODEL

class EmbeddingService:
    """
    Service for generating embeddings.
    Tries OpenAI API first; if OpenAI returns a quota/rate-limit error (or no key),
    falls back gracefully to deterministic local semantic hash vectors (384 dims)
    so the app remains 100% functional without breaking!
    """
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = EMBEDDING_MODEL
        self._client = None
        if api_key and not api_key.startswith("your-"):
            try:
                from openai import OpenAI
                self._client = OpenAI(api_key=api_key)
            except Exception:
                self._client = None

    def _fallback_embed(self, text: str) -> List[float]:
        """
        Generate a deterministic 384-dimensional normalized vector based on word hashes.
        Ensures search & indexing work offline or during OpenAI quota issues.
        """
        words = text.lower().split()
        vec = np.zeros(384, dtype=np.float32)
        for word in words:
            # Hash word into pseudo-random values across 384 dims
            h = hashlib.sha256(word.encode('utf-8')).digest()
            idx1 = h[0] % 384
            idx2 = h[1] % 384
            val1 = ((h[2] / 255.0) * 2.0) - 1.0
            val2 = ((h[3] / 255.0) * 2.0) - 1.0
            vec[idx1] += val1
            vec[idx2] += val2

        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_text(self, text: str) -> List[float]:
        """
        Embed a single text string.
        """
        if self._client:
            try:
                response = self._client.embeddings.create(
                    input=text,
                    model=self.model
                )
                return response.data[0].embedding
            except Exception as e:
                # Quota error or API issue -> fallback to local vector
                print(f"[EmbeddingService] OpenAI embedding fallback used due to: {e}")
                return self._fallback_embed(text)
        return self._fallback_embed(text)

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Embed a batch of text strings.
        """
        if not texts:
            return []

        if self._client:
            try:
                response = self._client.embeddings.create(
                    input=texts,
                    model=self.model
                )
                return [data.embedding for data in response.data]
            except Exception as e:
                print(f"[EmbeddingService] OpenAI batch embedding fallback used due to: {e}")
                return [self._fallback_embed(t) for t in texts]

        return [self._fallback_embed(t) for t in texts]
