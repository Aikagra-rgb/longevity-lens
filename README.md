# LongevityLens — Healthspan Analytics & Research Copilot

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Gemini](https://img.shields.io/badge/Gemini-3.6--flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

> A full-stack longevity research platform combining **Google Gemini**, **3072-dimensional semantic RAG search**, **Levine PhenoAge computation**, and **epigenetic clock simulation** to analyze healthspan data and generate research-backed intervention insights.

> **Live demo:** https://longevity-lens.onrender.com/ (hosted on Render's free plan, so the first load may take ~30-60s to wake up)

> **Disclaimer:** LongevityLens provides educational information only, not medical advice. Consult a healthcare provider for clinical decisions.

---

## Key Modules

| Module | Description |
|---|---|
| **Research Chat** | RAG copilot over the indexed research library. Streams answers (SSE) with citation cards and inline biomarker references. |
| **Consensus Engine** | Synthesizes conflicting literature into structured agreement/debate tables (e.g. NMN vs NR, senolytics). |
| **Multi-Clock Matrix** | Side-by-side comparison of PhenoAge, Horvath, GrimAge and DunedinPACE, plus a composite index. |
| **PhenoAge Biological Audit** | Levine PhenoAge from 8 clinical biomarkers, with PDF lab-report auto-fill. |
| **Epigenetic Clocks** | Simulated DNA-methylation age (Horvath, GrimAge, DunedinPACE). |
| **Healthspan Trajectory** | Multi-date blood panels, annual pace of aging (ΔBioAge/year) and SVG trend charts. |
| **Protocol Builder** | 4-tier personalized intervention stack (nutrition, exercise, supplements, sleep) with a daily schedule. |
| **Biomarker Reference** | 20+ biomarkers with optimal and clinical ranges. |
| **Document Library** | Upload your own PDFs; they are chunked, embedded and searchable by the copilot. |

---

## RAG Pipeline

| Item | Value |
|---|---|
| Pre-indexed papers | **15** research summaries (`backend/data/sample_papers/`) |
| Vector chunks | **86** |
| Embedding model | `gemini-embedding-2` (3072 dimensions) |
| Chat model | `gemini-3.6-flash` (fallback: `gemini-2.5-flash`, `gemini-2.0-flash`) |
| Retrieval | Top-K semantic search over a pure-Python vector store |
| Offline mode | Falls back to local context if the Gemini API is unavailable |

Pipeline: document → chunking → batch embedding → vector store → query embedding → top-K retrieval → Gemini streamed answer with citations.
If the embedding dimension changes, the vector store clears and re-indexes automatically.

### Indexed research library (15 papers)

| Topic | Papers |
|---|---|
| Cellular aging | Senolytics (fisetin, dasatinib), telomere length, inflammaging |
| Nutrient sensing | Rapamycin / mTOR, NAD+ decline, fasting & autophagy |
| Mitochondria | Mitochondrial biogenesis & urolithin A |
| Cardiometabolic | ApoB lipidomics, hs-CRP, metabolic health & insulin, HbA1c & glycation (AGEs) |
| Lifestyle | Exercise & VO2max, sleep architecture & glymphatic clearance, gut microbiome |
| Biomarkers | Epigenetic clocks & biological age |

Add more by dropping `.txt` files into `backend/data/sample_papers/` and calling `POST /api/documents/seed`, or by uploading PDFs in the Document Library.

---

## Architecture & Tech Stack

- **Backend:** FastAPI (Python 3.11+) with async and SSE streaming endpoints.
- **AI:** `google-genai` SDK; Gemini chat and embeddings.
- **PDF parsing:** PyMuPDF.
- **Frontend:** Vanilla JS single-page app (ES modules) served by FastAPI at `/`.
- **Deployment:** Docker (`Dockerfile`) and `render.yaml`.

```
backend/
  main.py            FastAPI app, health check, static frontend
  routers/           chat, documents, biomarkers, epigenetics, lab_reports,
                     trajectory, protocol, consensus, export
  services/          llm_service, vector_store, embeddings, document_parser,
                     trajectory, protocol_builder, consensus_engine
  data/sample_papers/  15 pre-seeded research summaries
frontend/            index.html, css, js/components (panels)
```

### Main API endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Status, indexed document count, chunk count |
| `POST /api/chat` | Streaming RAG chat |
| `GET/POST/DELETE /api/documents` | List, upload, remove documents; `POST /api/documents/seed` loads sample papers |
| `/api/trajectory`, `/api/protocol`, `/api/consensus` | Trajectory, protocol and consensus engines |
| `/api/biomarkers`, `/api/epigenetics`, `/api/lab-reports`, `/api/export` | Reference data, clocks, lab OCR, PDF export |

---

## Getting Started

### 1. Clone and configure

```bash
git clone https://github.com/Aikagra-rgb/longevity-lens.git
cd longevity-lens
cp .env.example .env   # then set GEMINI_API_KEY (https://aistudio.google.com/app/apikey)
```

### 2. Run locally

```bash
python -m venv venv
# activate the venv, then:
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

Open http://localhost:8000. Run the command from the repository root.

### 3. Run with Docker

```bash
docker build -t longevity-lens .
docker run -p 8000:8000 --env-file .env longevity-lens
```

### 4. Deploy on Render

The app is live at https://longevity-lens.onrender.com/, deployed on [Render](https://render.com) as a Docker web service, configured by `render.yaml` (service `longevity-lens`, free plan). To deploy your own copy: create a new Web Service (or Blueprint) from this repo, then set the `GEMINI_API_KEY` environment variable in the Render dashboard. The health check path is `/api/health`.

---

## License

Distributed under the MIT License.
