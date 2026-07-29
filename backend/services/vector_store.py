"""
Pure-Python vector store using numpy cosine similarity.
No C++ compilation required — works everywhere.
Persists data to JSON for simplicity.
"""
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional
from backend.config import CHROMA_DB_PATH, COLLECTION_NAME
import threading


class VectorStoreService:
    """
    Lightweight vector store using numpy for similarity search.
    Persists to a JSON file on disk.
    """
    def __init__(self):
        self.store_path = Path(CHROMA_DB_PATH)
        self.store_path.mkdir(parents=True, exist_ok=True)
        self.data_file = self.store_path / f"{COLLECTION_NAME}.json"
        self._lock = threading.Lock()
        self._data = self._load()

    def _load(self) -> Dict[str, Any]:
        """Load persisted data from disk."""
        if self.data_file.exists():
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {"documents": [], "embeddings": [], "metadatas": [], "ids": []}

    def _save(self):
        """Persist data to disk."""
        with open(self.data_file, "w", encoding="utf-8") as f:
            json.dump(self._data, f, ensure_ascii=False)

    def get_or_create_collection(self):
        """Compatibility method — no-op for this implementation."""
        return self

    def add_documents(self, docs: List[Dict[str, Any]]):
        """
        Add documents to the vector store.
        docs: list of dicts with 'id', 'text', 'embedding', 'metadata'
        """
        if not docs:
            return

        with self._lock:
            for doc in docs:
                doc_id = doc.get("id", f"doc_{len(self._data['ids'])}")
                self._data["ids"].append(doc_id)
                self._data["documents"].append(doc["text"])
                self._data["embeddings"].append(doc["embedding"])
                self._data["metadatas"].append(doc["metadata"])
            self._save()

    def query(self, embedding: List[float], top_k: int) -> List[Dict[str, Any]]:
        """
        Find top-k most similar documents using cosine similarity.
        """
        if not self._data["embeddings"]:
            return []

        query_vec = np.array(embedding, dtype=np.float32)
        doc_vecs = np.array(self._data["embeddings"], dtype=np.float32)

        # Cosine similarity
        query_norm = query_vec / (np.linalg.norm(query_vec) + 1e-10)
        doc_norms = doc_vecs / (np.linalg.norm(doc_vecs, axis=1, keepdims=True) + 1e-10)
        similarities = doc_norms @ query_norm

        # Get top-k indices
        k = min(top_k, len(similarities))
        top_indices = np.argsort(similarities)[-k:][::-1]

        results = []
        for idx in top_indices:
            results.append({
                "id": self._data["ids"][idx],
                "text": self._data["documents"][idx],
                "metadata": self._data["metadatas"][idx],
                "score": float(similarities[idx])
            })
        return results

    def delete_by_document_id(self, doc_id: str):
        """
        Delete all chunks for a specific document_id.
        """
        with self._lock:
            indices_to_keep = []
            for i, meta in enumerate(self._data["metadatas"]):
                if meta.get("document_id") != doc_id:
                    indices_to_keep.append(i)

            self._data["ids"] = [self._data["ids"][i] for i in indices_to_keep]
            self._data["documents"] = [self._data["documents"][i] for i in indices_to_keep]
            self._data["embeddings"] = [self._data["embeddings"][i] for i in indices_to_keep]
            self._data["metadatas"] = [self._data["metadatas"][i] for i in indices_to_keep]
            self._save()

    def get_all_document_ids(self) -> List[str]:
        """
        Get all unique document IDs.
        """
        doc_ids = set()
        for metadata in self._data["metadatas"]:
            if "document_id" in metadata:
                doc_ids.add(metadata["document_id"])
        return list(doc_ids)

    def get_all_documents_metadata(self) -> List[Dict[str, Any]]:
        """
        Aggregate metadata for all unique documents.
        """
        docs = {}
        for metadata in self._data["metadatas"]:
            doc_id = metadata.get("document_id")
            if not doc_id:
                continue
            if doc_id not in docs:
                docs[doc_id] = {
                    "id": doc_id,
                    "name": metadata.get("source", "Unknown"),
                    "pages": metadata.get("total_pages", 1),
                    "chunks": 0,
                    "uploaded_at": metadata.get("uploaded_at", ""),
                    "type": metadata.get("type", "unknown")
                }
            docs[doc_id]["chunks"] += 1

        return list(docs.values())

    def count(self) -> int:
        """
        Return the total number of chunks indexed.
        """
        return len(self._data["ids"])
