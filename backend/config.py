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
