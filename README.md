# 🧬 LongevityLens v3.0 — Enterprise Longevity Engine & Research Copilot

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Gemini](https://img.shields.io/badge/Gemini-3.6--flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![RAG](https://img.shields.io/badge/Architecture-RAG-8B5CF6?style=flat-square)](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

> **A production-grade, full-stack longevity platform** — combining Google Gemini 3.6-flash, 3072-dim semantic vector search, Levine PhenoAge computation, epigenetic DNA methylation clock simulation, multi-date healthspan trajectory tracking, and personalized intervention protocol generation.

---

## 🚀 9 Enterprise Modules

| Module | Description |
|---|---|
| **💬 Research Chat** | RAG copilot over 8+ longevity research papers. Gemini 3.6-flash streams answers with citation cards and inline biomarker reference tags |
| **🔬 Consensus Engine** | Synthesizes conflicting literature into structured scientific agreement/debate tables (NMN vs NR, Metformin vs Berberine, Senolytics) |
| **⚖️ Multi-Clock Matrix** | Side-by-side comparative matrix of 4 premier biological age clocks (Levine PhenoAge, Horvath DNAm, GrimAge, DunedinPACE) + Composite Index |
| **📊 Healthspan Trajectory** | Track multi-date blood panels over time, compute annual pace of aging ($\Delta \text{BioAge}/\text{Year}$), SVG trend lines & 5y/10y projections |
| **💊 Protocol Builder** | Generates customized 4-tier evidence-based intervention stack (Nutritional, Exercise, Supplements, Sleep) with daily execution schedules |
| **🧬 PhenoAge Biological Audit** | Levine PhenoAge algorithm — compute biological age delta from 8 clinical blood biomarkers. PDF lab report OCR auto-fill |
| **🧪 Epigenetic DNA Clocks** | Simulate Horvath DNAm Age, GrimAge mortality predictor, and DunedinPACE pace-of-aging from CpG beta-value sliders with genome heatmap |
| **📄 Document Library** | Upload PDF research papers → automatic chunking → semantic embedding → instantly searchable by the AI copilot |
| **📚 Biomarker Reference** | 20+ longevity biomarkers across 6 categories with clinical, reference, and optimal longevity ranges, plus lifestyle intervention guidance |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LongevityLens v3.0                      │
│                                                             │
│  ┌──────────────────────────────┐  ┌────────────────────┐  │
│  │      Frontend (Vanilla JS)   │  │   Backend (FastAPI) │  │
│  │                              │  │                    │  │
│  │  SPA • 9 Views               │  │  /api/chat  ──────►│──┐│
│  │  SSE stream parsing          │  │  /api/trajectory   │  ││
│  │  SVG Trend Line Engine       │  │  /api/protocol     │  ││
│  │  localStorage persistence    │  │  /api/consensus    │  ││
│  │  Glassmorphism UI            │  │  /api/epigenetics  │  ││
│  └──────────────────────────────┘  │  /api/documents    │  ││
│                                    └────────────────────┘  ││
│                                                             ││
│  ┌──────────────────┐  ┌────────────────────────────────┐  ││
│  │   RAG Pipeline   │  │         AI Services            │  ││
│  │                  │  │                                │  ││
│  │  embed_query()   │  │  gemini-3.6-flash (chat/SSE)   │◄─┘│
│  │  vector_search() │  │  gemini-embedding-2 (3072-dim) │   │
│  │  biomarker_tool()│  │  Multi-model 503 fallback      │   │
│  │  rag_pipeline()  │  └────────────────────────────────┘   │
│  └──────────────────┘                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Data Layer                         │   │
│  │  Pure-Python Vector Store (Dimension Auto-Recovery) │   │
│  │  20+ biomarkers (biomarker_ranges.json)             │   │
│  │  8 pre-seeded research summaries                    │   │
│  │  PyMuPDF PDF parser → chunk → embed → index        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔬 Key Technical Features

### RAG Pipeline & Multi-Model Fallback
- **Embedding**: `gemini-embedding-2` (3072-dim vectors) with `retrieval_query` / `retrieval_document` task types for asymmetric retrieval.
- **Vector Store**: Custom pure-Python NumPy implementation with automatic dimension mismatch recovery (zero C++ dependencies).
- **Multi-Model Fallback**: Cascades through `gemini-3.6-flash` ➔ `gemini-2.5-flash` ➔ `gemini-2.0-flash` ➔ offline mode to handle API capacity spikes seamlessly.

### Biological Age & Epigenetics
- **Levine PhenoAge**: 9 clinical parameters (alb, creat, gluc, crp, etc.) mapping to biological age acceleration.
- **DNA Methylation Clocks**: Horvath, GrimAge, DunedinPACE rate-of-aging speedometer.
- **Longitudinal Trajectory Engine**: Computes annual rate of aging ($\text{yrs/yr}$) from historical lab panels.

---

## ⚡ Quick Start

```bash
# 1. Clone
git clone https://github.com/Aikagra-rgb/longevity-lens.git
cd longevity-lens

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Configure
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 4. Run
python -m uvicorn backend.main:app --reload --port 8000

# 5. Open http://localhost:8000
```

---

## 🌐 Deploy on Render

1. Connect repository to [render.com](https://render.com)
2. Set environment variable: `GEMINI_API_KEY=your_key`
3. Build command: `pip install -r backend/requirements.txt`
4. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

---

*Built for the intersection of AI engineering and clinical longevity science. Educational use only — not medical advice.*
