from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from typing import Dict, Any, Optional
import re
from pydantic import BaseModel

from backend.services.biological_age import BiologicalAgeCalculator
from backend.services.document_parser import DocumentParser

router = APIRouter(prefix="/api/lab-reports", tags=["Lab Reports"])
document_parser = DocumentParser()

class BioAgeRequest(BaseModel):
    chronological_age: float
    labs: Dict[str, float]

@router.post("/calculate-age")
async def calculate_age_endpoint(request: BioAgeRequest):
    """
    Calculate Levine PhenoAge & Biological Age score from input lab values.
    """
    try:
        result = BiologicalAgeCalculator.calculate_pheno_age(
            chronological_age=request.chronological_age,
            labs=request.labs
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/parse-pdf")
async def parse_lab_pdf_endpoint(file: UploadFile = File(...), chronological_age: float = 45.0):
    """
    Extract lab biomarkers directly from uploaded PDF lab report and calculate biological age.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF lab reports are supported")

    try:
        file_bytes = await file.read()
        pages = document_parser.parse_pdf(file_bytes)
        full_text = "\n".join([p["text"] for p in pages])

        # Regex patterns to auto-extract clinical biomarkers from lab text
        extracted_labs = {}

        patterns = {
            "crp": r"(?:hs-?crp|c-reactive protein|crp)[\s:]*([\d\.]+)",
            "glucose": r"(?:fasting glucose|glucose)[\s:]*([\d\.]+)",
            "hba1c": r"(?:hba1c|hemoglobin a1c|a1c)[\s:]*([\d\.]+)",
            "triglycerides": r"(?:triglycerides|trig)[\s:]*([\d\.]+)",
            "apob": r"(?:apob|apolipoprotein b)[\s:]*([\d\.]+)",
            "hdl": r"(?:hdl|hdl-c|hdl cholesterol)[\s:]*([\d\.]+)",
            "vitamin_d": r"(?:vitamin d|25-oh vitamin d)[\s:]*([\d\.]+)",
            "albumin": r"(?:albumin)[\s:]*([\d\.]+)",
            "creatinine": r"(?:creatinine)[\s:]*([\d\.]+)",
            "wbc": r"(?:wbc|white blood count|white blood cell)[\s:]*([\d\.]+)",
            "mcv": r"(?:mcv)[\s:]*([\d\.]+)",
            "rdw": r"(?:rdw)[\s:]*([\d\.]+)"
        }

        text_lower = full_text.lower()
        for key, pattern in patterns.items():
            match = re.search(pattern, text_lower)
            if match:
                try:
                    val = float(match.group(1))
                    # Basic sanity bounds
                    if key == "crp" and val < 50: extracted_labs[key] = val
                    elif key == "glucose" and 40 <= val <= 400: extracted_labs[key] = val
                    elif key == "hba1c" and 3.5 <= val <= 18: extracted_labs[key] = val
                    elif key == "apob" and 20 <= val <= 300: extracted_labs[key] = val
                    elif key == "albumin" and 1.5 <= val <= 6.5: extracted_labs[key] = val
                    elif key == "creatinine" and 0.2 <= val <= 10.0: extracted_labs[key] = val
                    else: extracted_labs[key] = val
                except ValueError:
                    pass

        # Calculate PhenoAge with extracted values
        pheno_result = BiologicalAgeCalculator.calculate_pheno_age(
            chronological_age=chronological_age,
            labs=extracted_labs
        )

        return {
            "file_name": file.filename,
            "extracted_biomarkers": extracted_labs,
            "extracted_count": len(extracted_labs),
            "biological_age_analysis": pheno_result,
            "raw_text_preview": full_text[:500] + "..." if len(full_text) > 500 else full_text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
