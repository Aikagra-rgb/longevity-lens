from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.services.trajectory import TrajectoryEngine

router = APIRouter(prefix="/api/trajectory", tags=["Trajectory"])
trajectory_engine = TrajectoryEngine()

class TrajectoryRequest(BaseModel):
    chronological_age: float = 45.0
    lab_history: List[Dict[str, Any]]

@router.post("/calculate")
async def calculate_trajectory(req: TrajectoryRequest):
    """
    Calculate biological age trajectory over multiple historical lab dates.
    """
    try:
        return trajectory_engine.analyze_trajectory(req.chronological_age, req.lab_history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/preset")
async def get_preset_journey():
    """
    Return pre-packaged 12-month sample lab progression.
    """
    return trajectory_engine.get_preset_12_month_journey()
