from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, Optional

from backend.services.epigenetic_clock import EpigeneticClockEngine

router = APIRouter(prefix="/api/epigenetics", tags=["Epigenetics"])

class EpigeneticRequest(BaseModel):
    chronological_age: float = 45.0
    profile_key: str = "average_adult"
    custom_cpg: Optional[Dict[str, float]] = None

@router.get("/presets")
async def get_presets():
    """
    Return available pre-configured DNA methylation profiles.
    """
    return {"presets": EpigeneticClockEngine.PRESET_PROFILES}

@router.post("/calculate-clock")
async def calculate_epigenetic_clock(request: EpigeneticRequest):
    """
    Calculate DNAm Horvath Age, GrimAge mortality predictor, and DunedinPACE.
    """
    try:
        result = EpigeneticClockEngine.calculate_epigenetic_age(
            chronological_age=request.chronological_age,
            profile_key=request.profile_key,
            custom_cpg=request.custom_cpg
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
