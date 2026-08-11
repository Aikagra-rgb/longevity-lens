from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from typing import Optional
from backend.routers import chat, documents, biomarkers, lab_reports, export, epigenetics, trajectory, protocol, consensus
from backend.services.vector_store import VectorStoreService
from backend.services.gemini_client import validate_gemini_key
from backend.models.schemas import HealthResponse, ValidateKeyResponse
from backend.config import FRONTEND_DIR, GEMINI_API_KEY

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize vector store
    vs = VectorStoreService()
    yield

app = FastAPI(
    title="LongevityLens — Health/Longevity Data Copilot",
    description="Backend for RAG-powered health research assistant, biological age engine & epigenetic simulators",
    version="3.0.0",
    lifespan=lifespan
)

# CORS (Allow all for demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(biomarkers.router)
app.include_router(lab_reports.router)
app.include_router(epigenetics.router)
app.include_router(trajectory.router)
app.include_router(protocol.router)
app.include_router(consensus.router)
app.include_router(export.router)

# Health check
@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    vs = VectorStoreService()
    return HealthResponse(
        status="ok",
        documents_indexed=len(vs.get_all_document_ids()),
        total_chunks=vs.count(),
        has_api_key=bool(GEMINI_API_KEY)
    )

@app.post("/api/health/validate-key", response_model=ValidateKeyResponse, tags=["Health"])
async def validate_api_key(x_api_key: Optional[str] = Header(None)):
    client_key = (x_api_key or "").strip()
    if not client_key:
        if GEMINI_API_KEY:
            valid, message = validate_gemini_key(GEMINI_API_KEY)
            return ValidateKeyResponse(
                valid=valid,
                source="server",
                message=message if valid else f"Server key invalid: {message}"
            )
        return ValidateKeyResponse(valid=False, source="none", message="No API key provided")

    valid, message = validate_gemini_key(client_key)
    return ValidateKeyResponse(valid=valid, source="client", message=message)

# Mount frontend/static files at /
# We mount AFTER API routes so /api/* routes take priority
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
else:
    @app.get("/")
    def root_fallback():
        return {"message": "Frontend not found, API is running"}
