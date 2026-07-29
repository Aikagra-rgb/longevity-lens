# 🧬 LongevityLens — Health & Longevity Research Copilot

A premium, full-stack RAG-powered research assistant and biological age calculator specifically engineered to mirror **FOXO Technologies'** core domain (biological aging, DNA methylation clocks, inflammaging, and longevity risk assessment).

---

## ✨ Features

- **💬 RAG Health Research Assistant**: Ask natural language questions over health research papers & lab report PDFs (*"What does an elevated CRP marker indicate, and what lifestyle factors affect it?"*).
- **🧬 Biological Age & PhenoAge Audit Calculator**: Calculate estimated biological age, age delta (e.g. `-3.0 years younger`), and aging pace classification using clinical biomarker algorithms (Levine PhenoAge).
- **📄 PDF Lab Report Parser**: Automatically OCR-extract clinical biomarkers (`hs-CRP`, `Glucose`, `HbA1c`, `ApoB`, `Vitamin D`, `Triglycerides`) directly from uploaded lab PDF reports.
- **🧪 20+ Pre-Loaded Longevity Biomarkers**: Curated reference database with standard clinical ranges vs. longevity optimal ranges, elevated/low indications, and lifestyle interventions (diet, exercise, supplements).
- **📚 8 Pre-Seeded Longevity Research Papers**: Pre-indexed summaries of Horvath/GrimAge epigenetic clocks, NAD+ decline, VO2max mortality studies, inflammaging SASP, and insulin sensitivity.
- **📥 Downloadable Healthspan Reports**: Export complete Markdown/HTML Longevity Audit & Research Reports with 1-click.
- **🎨 Premium Dark-Mode Scientific UI**: Single Page Application built with vanilla JS, frosted glassmorphism, responsive navigation, and real-time Server-Sent Events (SSE) token streaming.

---

## 🛠️ Tech Stack

- **Backend**: Python 3.11, FastAPI, PyMuPDF, OpenAI GPT-4o-mini & Embeddings
- **Vector Storage**: Pure-Python NumPy vector store (zero C++ build dependencies, 100% portable)
- **Frontend**: Vanilla JS (ES6 modules), HTML5, CSS3 Glassmorphism theme
- **Deployment**: Docker, Render (`render.yaml`), Hugging Face Spaces

---

## 🚀 Quick Start (Local Development)

1. **Clone & Install Dependencies**:
   ```bash
   git clone https://github.com/your-username/happy-nobel.git
   cd happy-nobel
   python -m pip install -r backend/requirements.txt
   ```

2. **Set Environment Variables**:
   Copy `.env.example` to `.env` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **Launch Server**:
   ```bash
   python -m uvicorn backend.main:app --reload --port 8000
   ```
   Open **http://localhost:8000** in your web browser!

---

## ☁️ 1-Click Cloud Deployment (Render Free Tier)

1. Connect your repository to [Render.com](https://render.com).
2. Create a **New Web Service** → Select **Docker** environment.
3. Add environment variable `OPENAI_API_KEY`.
4. Deploy! Render will build the container and provide your live HTTPS URL.

---

## ⚠️ Disclaimer

*LongevityLens is an educational research copilot and informational analysis tool. It is not a diagnostic device and does not provide medical advice. Always consult a qualified healthcare provider for medical decisions.*
