from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from backend.models.schemas import BiomarkerListResponse, BiomarkerSearchResponse, Biomarker
from backend.services.biomarker_tool import BiomarkerTool

router = APIRouter(prefix="/api/biomarkers", tags=["Biomarkers"])
biomarker_tool = BiomarkerTool()

@router.get("", response_model=BiomarkerListResponse)
async def get_all_biomarkers():
    """
    Return all biomarkers grouped by category.
    """
    categories = biomarker_tool.get_all()
    return BiomarkerListResponse(categories=categories)

@router.get("/search", response_model=BiomarkerSearchResponse)
async def search_biomarkers(q: str = Query(..., min_length=1)):
    """
    Fuzzy search by name/abbreviation/alias.
    """
    results = biomarker_tool.search(q)
    return BiomarkerSearchResponse(results=results)

@router.get("/{identifier}", response_model=Biomarker)
async def get_biomarker(identifier: str):
    """
    Lookup by name or abbreviation (case-insensitive).
    """
    biomarker = biomarker_tool.lookup(identifier)
    if not biomarker:
        raise HTTPException(status_code=404, detail="Biomarker not found")
    return biomarker
