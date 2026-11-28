import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FRONTEND_DIR = BASE_DIR.parent / "frontend"

# ChromaDB / VectorStore Configuration
CHROMA_DB_PATH = str(BASE_DIR / "chroma_db")
COLLECTION_NAME = "health_research"

# Gemini Models (google-genai SDK v1+ naming)
EMBEDDING_MODEL = "gemini-embedding-2"   # Latest Google embedding model (3072-dim)
CHAT_MODEL = "gemini-3.6-flash"           # Latest Gemini model (3.6 series)

# Text Chunking
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

# Retrieval
TOP_K = 6

# ARES Level-2 Runtime Security & Optimization
ARES_GATEWAY_URL = os.getenv("ARES_GATEWAY_URL", "").strip()
ARES_API_KEY = os.getenv("ARES_API_KEY", "").strip()
ARES_ORG_ID = os.getenv("ARES_ORG_ID", "org_longevity_lens").strip()
ARES_APP_NAME = os.getenv("ARES_APP_NAME", "LongevityLensCopilot").strip()
ARES_CANARY_TOKEN = os.getenv("ARES_CANARY_TOKEN", "CANARY_LONGEVITY_LENS_01").strip()
ARES_OPTIMIZE_PROMPTS = os.getenv("ARES_OPTIMIZE_PROMPTS", "false").strip().lower() in ("1", "true", "yes")
ARES_FAIL_CLOSED = os.getenv("ARES_FAIL_CLOSED", "false").strip().lower() in ("1", "true", "yes")
