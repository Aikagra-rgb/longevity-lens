from fastapi import APIRouter, Header, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
from backend.models.schemas import ChatRequest
from backend.services.ares_guard import AresGuard
from backend.services.rag_pipeline import RAGPipeline
from backend.config import GEMINI_API_KEY

router = APIRouter(prefix="/api/chat", tags=["Chat"])
rag_pipeline = RAGPipeline()
ares_guard = AresGuard()


async def get_api_key(x_api_key: Optional[str] = Header(None)) -> str:
    # Use client-supplied key, or fall back to server GEMINI_API_KEY.
    # If neither is present, return empty string — the LLMService will use offline RAG fallback.
    client_key = (x_api_key or "").strip()
    if client_key:
        return client_key
    return GEMINI_API_KEY or ""


@router.post("")
async def chat_endpoint(
    request: ChatRequest,
    x_ares_enforce_http: Optional[str] = Header(None),
    api_key: str = Depends(get_api_key),
):
    """
    Chat endpoint for the copilot. Enforces ARES Level-2 inspection and returns SSE stream.
    """
    try:
        decision = await ares_guard.inspect_inbound(request.query)
        headers = {
            "X-Ares-Action": decision.action,
            "X-Ares-Risk-Score": str(decision.risk_score),
        }
        if not decision.allowed:
            if (x_ares_enforce_http or "").strip().lower() in ("1", "true", "yes"):
                raise HTTPException(
                    status_code=403,
                    detail={
                        "action": decision.action,
                        "matched_technique": decision.matched_technique,
                        "explanation": decision.explanation,
                    },
                    headers=headers,
                )
            return StreamingResponse(
                ares_guard.blocked_sse_stream(decision),
                media_type="text/event-stream",
                headers=headers,
            )

        return StreamingResponse(
            ares_guard.filter_sse_stream(
                rag_pipeline.query(decision.effective_query, request.history, api_key)
            ),
            media_type="text/event-stream",
            headers=headers,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
