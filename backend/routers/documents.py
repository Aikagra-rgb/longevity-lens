from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import Optional
from datetime import datetime
import uuid
import os
from pathlib import Path

from backend.models.schemas import DocumentUploadResponse, DocumentListResponse, DeleteDocumentResponse, SeedResponse, DocumentItem
from backend.services.vector_store import VectorStoreService
from backend.services.document_parser import DocumentParser
from backend.services.embeddings import EmbeddingService
from backend.config import OPENAI_API_KEY, DATA_DIR
from backend.routers.chat import get_api_key

router = APIRouter(prefix="/api/documents", tags=["Documents"])
vector_store = VectorStoreService()
document_parser = DocumentParser()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(file: UploadFile = File(...), api_key: str = Depends(get_api_key)):
    """
    Upload a PDF document, parse, chunk, embed, and store in vector database.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    try:
        file_bytes = await file.read()
        doc_id = str(uuid.uuid4())
        
        parsed_pages = document_parser.parse_pdf(file_bytes)
        
        # Merge text
        full_text = "\n\n".join([page["text"] for page in parsed_pages])
        chunks = document_parser.chunk_text(full_text, file.filename, {"document_id": doc_id, "type": "research_paper", "total_pages": len(parsed_pages)})
        
        # Embed chunks
        embedding_service = EmbeddingService(api_key)
        texts = [chunk["text"] for chunk in chunks]
        embeddings = embedding_service.embed_batch(texts)
        
        for i, chunk in enumerate(chunks):
            chunk["embedding"] = embeddings[i]
            
        vector_store.add_documents(chunks)
        
        return DocumentUploadResponse(
            id=doc_id,
            name=file.filename,
            pages=len(parsed_pages),
            chunks=len(chunks),
            uploaded_at=datetime.utcnow().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=DocumentListResponse)
async def list_documents():
    """
    List all documents from ChromaDB metadata.
    """
    try:
        docs = vector_store.get_all_documents_metadata()
        return DocumentListResponse(documents=docs)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{document_id}", response_model=DeleteDocumentResponse)
async def delete_document(document_id: str):
    """
    Remove document chunks from ChromaDB.
    """
    try:
        vector_store.delete_by_document_id(document_id)
        return DeleteDocumentResponse(success=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seed", response_model=SeedResponse)
async def seed_documents(api_key: str = Depends(get_api_key)):
    """
    Load sample papers from backend/data/sample_papers/ and index them.
    Supports both .txt and .pdf files.
    """
    try:
        sample_dir = DATA_DIR / "sample_papers"
        if not sample_dir.exists():
            return SeedResponse(seeded=0, total_chunks=0)

        # Check if already seeded by looking for sample-type docs
        existing = vector_store.get_all_documents_metadata()
        sample_docs = [d for d in existing if d.get("type") == "sample"]
        if len(sample_docs) > 0:
            return SeedResponse(seeded=len(sample_docs), total_chunks=vector_store.count())
            
        seeded_count = 0
        total_chunks = 0
        
        embedding_service = EmbeddingService(api_key)
        
        # Process .txt files (sample research summaries)
        for file_path in sample_dir.glob("*.txt"):
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
            
            doc_id = str(uuid.uuid4())
            chunks = document_parser.chunk_text(
                text, 
                file_path.stem.replace("_", " ").title() + " (Sample)", 
                {"document_id": doc_id, "type": "sample", "total_pages": 1}
            )
            
            texts = [chunk["text"] for chunk in chunks]
            embeddings = embedding_service.embed_batch(texts)
            
            for i, chunk in enumerate(chunks):
                chunk["embedding"] = embeddings[i]
                
            vector_store.add_documents(chunks)
            seeded_count += 1
            total_chunks += len(chunks)

        # Process .pdf files if any
        for file_path in sample_dir.glob("*.pdf"):
            with open(file_path, "rb") as f:
                file_bytes = f.read()
                
            doc_id = str(uuid.uuid4())
            parsed_pages = document_parser.parse_pdf(file_bytes)
            full_text = "\n\n".join([page["text"] for page in parsed_pages])
            chunks = document_parser.chunk_text(
                full_text, 
                file_path.name, 
                {"document_id": doc_id, "type": "sample", "total_pages": len(parsed_pages)}
            )
            
            texts = [chunk["text"] for chunk in chunks]
            embeddings = embedding_service.embed_batch(texts)
            
            for i, chunk in enumerate(chunks):
                chunk["embedding"] = embeddings[i]
                
            vector_store.add_documents(chunks)
            seeded_count += 1
            total_chunks += len(chunks)
            
        return SeedResponse(seeded=seeded_count, total_chunks=total_chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
