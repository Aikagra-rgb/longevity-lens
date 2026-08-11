from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: List[ChatMessage] = []

class Range(BaseModel):
    min: float
    max: float

class Biomarker(BaseModel):
    name: str
    abbreviation: str
    aliases: List[str] = []
    category: str
    unit: str
    reference_range: Range
    optimal_range: Range
    critical_high: Optional[float] = None
    critical_low: Optional[float] = None
    elevated_indicates: List[str] = []
    low_indicates: List[str] = []
    lifestyle_factors: Dict[str, List[str]] = {}
    related_panels: List[str] = []
    longevity_relevance: str

class DocumentUploadResponse(BaseModel):
    id: str
    name: str
    pages: int
    chunks: int
    uploaded_at: str

class DocumentItem(BaseModel):
    id: str
    name: str
    pages: int
    chunks: int
    uploaded_at: str
    type: str

class DocumentListResponse(BaseModel):
    documents: List[DocumentItem]

class DeleteDocumentResponse(BaseModel):
    success: bool

class SeedResponse(BaseModel):
    seeded: int
    total_chunks: int

class BiomarkerCategory(BaseModel):
    name: str
    icon: str
    biomarkers: List[Biomarker]

class BiomarkerListResponse(BaseModel):
    categories: List[BiomarkerCategory]

class BiomarkerSearchResponse(BaseModel):
    results: List[Biomarker]

class HealthResponse(BaseModel):
    status: str
    documents_indexed: int
    total_chunks: int
    has_api_key: bool

class ValidateKeyResponse(BaseModel):
    valid: bool
    source: str  # "client", "server", or "none"
    message: str
