from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel
from backend.services.protocol_builder import ProtocolBuilderEngine
from backend.services.biological_age import BiologicalAgeCalculator

router = APIRouter(prefix="/api/protocol", tags=["Protocol"])
protocol_engine = ProtocolBuilderEngine()
bio_age_calc = BiologicalAgeCalculator()

class ProtocolRequest(BaseModel):
    chronological_age: float = 45.0
    labs: Dict[str, float]

@router.post("/generate")
async def generate_protocol(req: ProtocolRequest):
    """
    Generate evidence-based 4-tier longevity intervention stack.
    """
    try:
        pheno_analysis = bio_age_calc.calculate_pheno_age(req.chronological_age, req.labs)
        return protocol_engine.generate_protocol(pheno_analysis)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
