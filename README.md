# LongevityLens — Healthspan Analytics & Research Copilot

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Gemini](https://img.shields.io/badge/Gemini-3.6--flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![License](https://img.shields.io/badge/License-MIT-10b981?style=flat-square)](LICENSE)

> A full-stack longevity research platform combining **Google Gemini 3.6-flash**, **3072-dim semantic vector RAG search**, **Levine PhenoAge computation**, and **epigenetic biological clock simulations** to analyze healthspan trajectory data and generate research-backed intervention insights.

---

## Key Modules

- **Research Copilot:** RAG copilot over longevity research papers. Gemini 3.6-flash streams responses with citation cards and inline biomarker references.
- **Consensus Engine:** Synthesizes conflicting literature into structured scientific agreement and debate tables.
- **Multi-Clock Matrix:** Side-by-side comparative matrix of 4 premier biological age clocks (Levine PhenoAge, Horvath Epigenetic, Hannum, GrimAge).
- **Biomarker Pipeline:** Automated extraction and calculation of biological age metrics from panel data.
- **Protocol Generator:** Personalized intervention and longevity protocol recommendations grounded in peer-reviewed literature.

---

## Architecture & Tech Stack

- **Backend:** FastAPI (Python 3.11+) with async streaming endpoints.
- **LLM & Embeddings:** Google Gemini 3.6-flash API with 3072-dimensional vector embeddings for RAG retrieval.
- **Containerization:** Docker & Docker Compose setup (Dockerfile, 
ender.yaml).
- **Frontend:** Responsive Web Interface.

---

## Getting Started

### 1. Clone & Configure

`ash
git clone https://github.com/Aikagra-rgb/longevity-lens.git
cd longevity-lens
cp .env.example .env
`

### 2. Run via Docker

`ash
docker-compose up --build
`

### 3. Run Locally

`ash
cd backend
python -m venv venv
# activate venv
pip install -r requirements.txt
uvicorn main:app --reload
`

---

## License

Distributed under the MIT License.
