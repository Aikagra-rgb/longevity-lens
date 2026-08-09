from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Dict, Any, Optional
from pydantic import BaseModel
from backend.services.consensus_engine import ConsensusEngine
from backend.routers.chat import get_api_key

router = APIRouter(prefix="/api/consensus", tags=["Consensus"])
consensus_engine = ConsensusEngine()

class ConsensusRequest(BaseModel):
    query: str

@router.get("/topics")
async def get_topics():
    """Get list of preset longevity research topics."""
    return consensus_engine.get_preset_topics()

@router.post("/analyze")
async def analyze_consensus(req: ConsensusRequest, api_key: str = Depends(get_api_key)):
    """Analyze multi-paper literature consensus for a query."""
    try:
        return await consensus_engine.generate_consensus(req.query, api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
