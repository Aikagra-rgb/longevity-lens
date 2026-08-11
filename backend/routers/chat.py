from fastapi import APIRouter, Header, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
from backend.models.schemas import ChatRequest
from backend.services.rag_pipeline import RAGPipeline
from backend.config import GEMINI_API_KEY

router = APIRouter(prefix="/api/chat", tags=["Chat"])
rag_pipeline = RAGPipeline()

async def get_api_key(x_api_key: Optional[str] = Header(None)) -> str:
    # Use client-supplied key, or fall back to server GEMINI_API_KEY.
    # If neither is present, return empty string — the LLMService will use offline RAG fallback.
    client_key = (x_api_key or "").strip()
    if client_key:
        return client_key
    return GEMINI_API_KEY or ""

@router.post("")
async def chat_endpoint(request: ChatRequest, api_key: str = Depends(get_api_key)):
    """
    Chat endpoint for the copilot. Returns Server-Sent Events (SSE) stream.
    """
    try:
        return StreamingResponse(
            rag_pipeline.query(request.query, request.history, api_key),
            media_type="text/event-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
