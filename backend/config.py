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

# Gemini Models
EMBEDDING_MODEL = "models/text-embedding-004"   # Google's latest embedding model (768-dim)
CHAT_MODEL = "gemini-1.5-flash"                  # Fast, capable, generous free tier

# Text Chunking
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150

# Retrieval
TOP_K = 6
