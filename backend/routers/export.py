from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter(prefix="/api/reports", tags=["Reports"])

class ExportReportRequest(BaseModel):
    query: Optional[str] = None
    messages: List[Dict[str, Any]] = []
    bio_age_data: Optional[Dict[str, Any]] = None
    biomarkers: List[Dict[str, Any]] = []

@router.post("/export")
async def export_report_endpoint(request: ExportReportRequest):
    """
    Generate a downloadable Markdown / HTML Longevity Research & Healthspan Report.
    """
    try:
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        report = f"# 🧬 LongevityLens — Healthspan & Research Audit Report\n"
        report += f"**Generated On**: {now_str}\n"
        report += f"**Classification**: Educational Research Assessment (Not Medical Advice)\n\n"
        report += f"---\n\n"

        if request.bio_age_data:
            data = request.bio_age_data
            report += f"## 📊 Biological Age & Longevity Score Analysis\n"
            report += f"- **Chronological Age**: {data.get('chronological_age', 'N/A')} years\n"
            report += f"- **Estimated Biological Age (PhenoAge)**: **{data.get('pheno_age', 'N/A')} years**\n"
            report += f"- **Biological Age Delta**: **{data.get('age_delta', 'N/A')} years**\n"
            report += f"- **Aging Trajectory**: {data.get('pace_category', 'N/A')}\n"
            report += f"- **Overall Longevity Health Score**: {data.get('overall_health_score', 'N/A')} / 100\n\n"

            if data.get('sub_scores'):
                sub = data['sub_scores']
                report += f"### Sub-System Health Scores:\n"
                report += f"- 🔥 **Inflammaging Score**: {sub.get('inflammaging', 'N/A')}/100\n"
                report += f"- ⚡ **Metabolic Health Score**: {sub.get('metabolic', 'N/A')}/100\n"
                report += f"- ❤️ **Cardiovascular Risk Score**: {sub.get('cardiovascular', 'N/A')}/100\n\n"

            if data.get('recommendations'):
                report += f"### 🎯 Actionable Longevity Interventions:\n"
                for rec in data['recommendations']:
                    report += f"- **{rec['biomarker']}** (Value: `{rec['value']}`, Target: `{rec['target']}`)\n"
                    report += f"  > *Intervention*: {rec['action']}\n\n"

        if request.biomarkers:
            report += f"## 🧪 Reviewed Biomarker Reference Data\n"
            for b in request.biomarkers:
                report += f"### {b['name']} ({b['abbreviation']})\n"
                report += f"- **Category**: {b.get('category', 'N/A')}\n"
                report += f"- **Reference Range**: {b['reference_range']['min']} – {b['reference_range']['max']} {b['unit']}\n"
                report += f"- **Optimal Longevity Target**: {b['optimal_range']['min']} – {b['optimal_range']['max']} {b['unit']}\n"
                if b.get('longevity_relevance'):
                    report += f"- **Longevity Relevance**: {b['longevity_relevance']}\n\n"

        if request.messages:
            report += f"## 💬 Research Assistant Conversation Transcript\n"
            for msg in request.messages:
                role_label = "User" if msg.get("role") == "user" else "LongevityLens Assistant"
                report += f"### {role_label}:\n{msg.get('content', '')}\n\n"

        report += f"---\n\n"
        report += f"**Notice**: This report was compiled by LongevityLens, a RAG-powered research copilot. "
        report += f"It is intended solely for educational analysis and research review, not medical diagnosis or treatment.\n"

        return Response(
            content=report,
            media_type="text/markdown",
            headers={"Content-Disposition": "attachment; filename=LongevityLens_Healthspan_Report.md"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
