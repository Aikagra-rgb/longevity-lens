from fastapi import APIRouter, Header, HTTPException, Request, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
from backend.models.schemas import ChatRequest
from backend.services.rag_pipeline import RAGPipeline
from backend.config import OPENAI_API_KEY

router = APIRouter(prefix="/api/chat", tags=["Chat"])
rag_pipeline = RAGPipeline()

async def get_api_key(x_api_key: Optional[str] = Header(None)) -> str:
    api_key = x_api_key or OPENAI_API_KEY
    if not api_key:
        raise HTTPException(status_code=401, detail="API key is required")
    return api_key

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
