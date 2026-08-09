# 🧬 LongevityLens — AI Health Research Copilot

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Gemini](https://img.shields.io/badge/Gemini-3.6--flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![RAG](https://img.shields.io/badge/Architecture-RAG-8B5CF6?style=flat-square)](https://en.wikipedia.org/wiki/Retrieval-augmented_generation)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

> **A production-grade, RAG-powered longevity research platform** — combining Google Gemini 3.6-flash, semantic vector search, PhenoAge biological age computation, and epigenetic DNA methylation clock simulation in a single full-stack application.

---

## 🚀 Live Features

| Module | Description |
|---|---|
| **💬 Research Chat** | RAG copilot over 8+ longevity research papers. Gemini 3.6-flash streams answers with citation cards and inline biomarker reference tags |
| **🧬 PhenoAge Biological Audit** | Levine PhenoAge algorithm — compute biological age delta from 8 clinical biomarkers (CRP, glucose, HbA1c, ApoB, triglycerides, vitamin D, albumin, creatinine). PDF lab report OCR auto-fill |
| **🔬 Epigenetic DNA Clocks** | Simulate Horvath DNAm Age, GrimAge mortality predictor, and DunedinPACE pace-of-aging from CpG beta-value sliders. Genome heatmap visualization |
| **🧪 Biomarker Reference** | 20+ longevity biomarkers across 6 categories with clinical, reference, and optimal longevity ranges, plus lifestyle intervention guidance |
| **📄 Document Library** | Upload PDF research papers → automatic chunking → semantic embedding → instantly searchable by the AI copilot |
| **🏠 Analytics Dashboard** | Live system status, tech stack breakdown, animated metric cards, and quick-action routing |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     LongevityLens v2.0                      │
│                                                             │
│  ┌──────────────────────────────┐  ┌────────────────────┐  │
│  │      Frontend (Vanilla JS)   │  │   Backend (FastAPI) │  │
│  │                              │  │                    │  │
│  │  SPA • ES6 modules           │  │  /api/chat  ──────►│──┐│
│  │  SSE stream parsing          │  │  /api/biomarkers   │  ││
│  │  localStorage persistence    │  │  /api/lab-reports  │  ││
│  │  Glassmorphism UI            │  │  /api/epigenetics  │  ││
│  └──────────────────────────────┘  │  /api/documents    │  ││
│                                    └────────────────────┘  ││
│                                                             ││
│  ┌──────────────────┐  ┌────────────────────────────────┐  ││
│  │   RAG Pipeline   │  │         AI Services            │  ││
│  │                  │  │                                │  ││
│  │  embed_query()   │  │  gemini-3.6-flash (chat/SSE)   │◄─┘│
│  │  vector_search() │  │  gemini-embedding-2 (3072-dim) │   │
│  │  biomarker_tool()│  │  Offline hash fallback         │   │
│  │  rag_pipeline()  │  └────────────────────────────────┘   │
│  └──────────────────┘                                       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Data Layer                         │   │
│  │  Pure-Python NumPy Vector Store (no C++ deps)       │   │
│  │  20+ biomarkers (biomarker_ranges.json)             │   │
│  │  8 pre-seeded research summaries                    │   │
│  │  PyMuPDF PDF parser → chunk → embed → index        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔬 Technical Highlights

### RAG Pipeline (Retrieval-Augmented Generation)
- **Embedding**: `gemini-embedding-2` (3072-dim vectors) with `retrieval_query` / `retrieval_document` task types for asymmetric retrieval
- **Vector Store**: Custom pure-Python NumPy implementation (avoids C++ build issues on Render/Heroku slim containers)
- **Retrieval**: Cosine similarity Top-K search over pre-chunked research papers
- **Augmentation**: Retrieved chunks + detected biomarker reference data injected into system prompt
- **Streaming**: SSE (Server-Sent Events) with `token`, `citations`, `biomarkers`, `done` event types

### Biological Age Engine
- **Algorithm**: Levine PhenoAge (validated on NHANES data, published *Aging* 2018)
- **Inputs**: CRP, glucose, HbA1c, ApoB, triglycerides, vitamin D, albumin, creatinine
- **Outputs**: Biological age, age delta, pace category, sub-system health scores (inflammaging, metabolic, cardiovascular), targeted interventions
- **OCR**: PyMuPDF regex extraction for lab report PDFs (Quest Diagnostics / Labcorp format)

### Epigenetic Clock Simulator
- **Horvath DNAm Age**: 353 CpG sites, validated across tissues
- **GrimAge**: Plasma protein DNAm surrogates for mortality prediction
- **DunedinPACE**: Pace of biological aging (e.g., 0.81 yrs/yr) from 20 CpG sites
- Interactive CpG beta-value sliders with real-time clock recalculation

### Graceful Fallback Architecture
- If Gemini API is unavailable → deterministic hash embeddings + structured RAG context response
- Visitors with no API key → automatically uses server key (set `GEMINI_API_KEY` in Render env)
- All features (BioAge, Epigenetics, Biomarkers) work 100% offline — no API key required

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

## 🔑 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key — get free at [aistudio.google.com](https://aistudio.google.com/app/apikey) | Optional (app works offline) |

---

## 🐳 Docker

```bash
docker build -t longevitylens .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key longevitylens
```

---

## 🌐 Deploy on Render (Free)

1. Fork this repo
2. Connect to [render.com](https://render.com) → New Web Service → Select your fork
3. Set environment variable: `GEMINI_API_KEY=your_key`
4. Build command: `pip install -r backend/requirements.txt`
5. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`

---

## 📁 Project Structure

```
longevity-lens/
├── backend/
│   ├── main.py                    # FastAPI app + static file serving
│   ├── config.py                  # Environment config
│   ├── requirements.txt
│   ├── routers/
│   │   ├── chat.py                # SSE streaming chat endpoint
│   │   ├── biomarkers.py          # Biomarker lookup + fuzzy search
│   │   ├── documents.py           # PDF upload + vector indexing
│   │   ├── lab_reports.py         # PhenoAge calculation + PDF OCR
│   │   ├── epigenetics.py         # Epigenetic clock endpoints
│   │   └── export.py              # Longevity report export
│   ├── services/
│   │   ├── rag_pipeline.py        # Main RAG orchestration
│   │   ├── embeddings.py          # Gemini embedding-2 service
│   │   ├── llm_service.py         # Gemini 3.6-flash streaming
│   │   ├── vector_store.py        # NumPy vector store
│   │   ├── document_parser.py     # PyMuPDF + text chunker
│   │   ├── biological_age.py      # Levine PhenoAge engine
│   │   ├── epigenetic_clock.py    # Horvath/GrimAge/DunedinPACE
│   │   └── biomarker_tool.py      # Biomarker JSON lookup
│   └── data/
│       ├── biomarker_ranges.json  # 20+ biomarkers with ranges
│       └── sample_papers/         # 8 pre-loaded research summaries
├── frontend/
│   ├── index.html
│   ├── css/
│   │   ├── index.css              # Design system
│   │   ├── chat.css               # Chat UI
│   │   └── biomarker.css          # Biomarker panel
│   └── js/
│       ├── main.js                # App init + routing
│       ├── components/
│       │   ├── DashboardPanel.js  # Analytics dashboard
│       │   ├── Chat.js            # RAG copilot UI
│       │   ├── BioAgePanel.js     # Biological age UI
│       │   ├── EpigeneticPanel.js # Epigenetic clocks UI
│       │   ├── BiomarkerPanel.js  # Biomarker browser
│       │   ├── DocumentUpload.js  # PDF upload UI
│       │   ├── Sidebar.js         # Navigation
│       │   └── Header.js          # App header
│       └── utils/
│           ├── api.js             # Fetch helpers + SSE parser
│           └── markdown.js        # Markdown renderer
├── Dockerfile
├── render.yaml
└── README.md
```

---

## 🤝 Domain Context (FOXO Technologies)

This project directly targets FOXO's core technology domain:
- **DNA Methylation Clocks**: Horvath, GrimAge, DunedinPACE — the same frameworks FOXO uses for life insurance underwriting
- **Biological Age Delta**: Difference between chronological and biological age — central to FOXO's underwriting thesis
- **Inflammaging**: CRP, IL-6, TNF-α as aging biomarkers — FOXO's primary research focus
- **RAG over Research Literature**: Demonstrating ability to build production AI systems over medical research data

---

*Built for the intersection of AI engineering and longevity science. Educational use only — not medical advice.*
