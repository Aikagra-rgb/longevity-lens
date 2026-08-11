from typing import Optional, Tuple
from backend.config import GEMINI_API_KEY


def _try_init_client(api_key: str) -> Optional[object]:
    if not api_key or api_key.startswith("your-"):
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"[GeminiClient] Could not initialise client: {e}")
        return None


def resolve_gemini_client(preferred_key: str) -> Tuple[Optional[object], str]:
    """
    Return a Gemini client and the key it was initialised with.
    Tries the preferred (client) key first, then falls back to the server key.
    """
    preferred_key = (preferred_key or "").strip()
    if preferred_key:
        client = _try_init_client(preferred_key)
        if client:
            return client, preferred_key

    if GEMINI_API_KEY and GEMINI_API_KEY != preferred_key:
        client = _try_init_client(GEMINI_API_KEY)
        if client:
            return client, GEMINI_API_KEY

    return None, preferred_key or GEMINI_API_KEY or ""


def validate_gemini_key(api_key: str) -> Tuple[bool, str]:
    """Run a minimal Gemini call to verify that an API key works."""
    api_key = (api_key or "").strip()
    if not api_key or api_key.startswith("your-"):
        return False, "No valid API key provided"

    client = _try_init_client(api_key)
    if not client:
        return False, "Could not initialise Gemini client"

    try:
        client.models.embed_content(model="gemini-embedding-2", contents="test")
        return True, "API key is valid"
    except Exception as e:
        return False, str(e)
