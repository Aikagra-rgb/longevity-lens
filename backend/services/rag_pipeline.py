import json
from typing import AsyncGenerator
from backend.services.embeddings import EmbeddingService
from backend.services.vector_store import VectorStoreService
from backend.services.llm_service import LLMService
from backend.services.biomarker_tool import BiomarkerTool
from backend.config import TOP_K

class RAGPipeline:
    """
    RAGPipeline main orchestrator.
    """
    def __init__(self):
        self.vector_store = VectorStoreService()
        self.biomarker_tool = BiomarkerTool()

    async def query(self, query_text: str, history: list, api_key: str) -> AsyncGenerator[str, None]:
        """
        Query orchestrator returning SSE events.
        """
        try:
            # 1. Embed the query
            embedding_service = EmbeddingService(api_key)
            query_embedding = embedding_service.embed_text(query_text)
            
            # 2. Search ChromaDB for top-k relevant chunks
            context_chunks = self.vector_store.query(query_embedding, top_k=TOP_K)
            
            # 3. Detect biomarker mentions
            detected_biomarkers_names = self.biomarker_tool.detect_biomarkers_in_text(query_text)
            
            # 4. Get biomarker data
            biomarker_data = []
            for name in detected_biomarkers_names:
                b_data = self.biomarker_tool.lookup(name)
                if b_data:
                    biomarker_data.append(b_data)
            
            # 5. LLM service
            llm_service = LLMService(api_key)
            messages = [{"role": msg.role, "content": msg.content} for msg in history]
            messages.append({"role": "user", "content": query_text})
            
            # 6. Stream LLM response
            async for token in llm_service.stream_chat(messages, context_chunks, biomarker_data):
                data = json.dumps({"content": token})
                yield f"event: token\ndata: {data}\n\n"
                
            # 7. Citations event
            citations = []
            for i, chunk in enumerate(context_chunks):
                citations.append({
                    "id": i + 1,
                    "source": chunk["metadata"].get("source", "Unknown"),
                    "section": chunk["metadata"].get("section", "Unknown"),
                    "text": chunk["text"][:200] + "..." if len(chunk["text"]) > 200 else chunk["text"]
                })
            
            data = json.dumps({"citations": citations})
            yield f"event: citations\ndata: {data}\n\n"
            
            # 8. Biomarkers event
            if biomarker_data:
                data = json.dumps({"biomarkers": biomarker_data})
                yield f"event: biomarkers\ndata: {data}\n\n"
                
            # 9. Done event
            yield f"event: done\ndata: {{}}\n\n"
            
        except Exception as e:
            data = json.dumps({"message": str(e)})
            yield f"event: error\ndata: {data}\n\n"
