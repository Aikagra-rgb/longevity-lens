from backend.config import CHAT_MODEL
from backend.services.gemini_client import resolve_gemini_client
from typing import List, Dict, Any, AsyncGenerator
import asyncio

class LLMService:
    """
    LLMService using the new google-genai SDK (v1+).
    Uses gemini-3.6-flash with automatic fallback to gemini-2.5-flash and gemini-2.0-flash
    on 503 / 429 capacity spikes before defaulting to local offline RAG mode.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model_name = CHAT_MODEL
        self.candidate_models = [CHAT_MODEL, "gemini-2.5-flash", "gemini-2.0-flash"]
        self.client, self.api_key = resolve_gemini_client(api_key)

    def build_system_prompt(self) -> str:
        return """You are LongevityLens — a Health & Longevity Research Copilot powered by RAG (Retrieval-Augmented Generation).

Your role is to help researchers, clinicians, and health-conscious individuals explore longevity biomarker data and published research findings.

CRITICAL INSTRUCTIONS:
1. DISCLAIMER: Always include a brief note that this information is for educational and informational purposes only and does NOT constitute medical advice.
2. CITATIONS: Cite your sources using [1], [2], etc., matching the numbered context passages provided below.
3. BIOMARKERS: When biomarker reference data is provided, incorporate reference ranges, optimal ranges, and lifestyle factors.
4. TONE: Professional, evidence-based scientific tone.
"""

    async def _fallback_stream(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[Dict[str, Any]],
        biomarker_data: List[Dict[str, Any]],
        error_msg: str
    ) -> AsyncGenerator[str, None]:
        user_query = messages[-1]["content"] if messages else "health query"

        header = f"> ℹ️ **Notice**: *Gemini API is currently unavailable ({error_msg}). LongevityLens is responding in **Offline Research Mode** using local RAG context.*\n\n"
        for char in header:
            yield char
            await asyncio.sleep(0.002)

        disclaimer = "⚠️ **Disclaimer**: *This copilot provides educational information only — not medical advice. Consult a healthcare provider for clinical decisions.*\n\n"
        for char in disclaimer:
            yield char
            await asyncio.sleep(0.002)

        body = f"### Research Findings for: \"{user_query}\"\n\n"

        if biomarker_data:
            body += "#### 🧪 Relevant Biomarker Data:\n"
            for b in biomarker_data:
                body += f"- **{b['name']} ({b['abbreviation']})**\n"
                body += f"  - **Reference Range**: {b['reference_range']['min']} – {b['reference_range']['max']} {b['unit']}\n"
                body += f"  - **Optimal (Longevity) Range**: {b['optimal_range']['min']} – {b['optimal_range']['max']} {b['unit']}\n"
                if b.get('elevated_indicates'):
                    body += f"  - **Elevated Indicates**: {', '.join(b['elevated_indicates'])}\n"
                if b.get('lifestyle_factors'):
                    dec = b['lifestyle_factors'].get('decreases', [])
                    inc = b['lifestyle_factors'].get('increases', [])
                    if dec:
                        body += f"  - **Lifestyle Interventions to Lower**: {', '.join(dec)}\n"
                    if inc:
                        body += f"  - **Factors Increasing Levels**: {', '.join(inc)}\n"
                if b.get('longevity_relevance'):
                    body += f"  - **Longevity Relevance**: {b['longevity_relevance']}\n"
                body += "\n"

        if context_chunks:
            body += "#### 📚 Retrieved Literature Summaries:\n"
            for i, chunk in enumerate(context_chunks):
                source = chunk['metadata'].get('source', 'Research Document')
                section = chunk['metadata'].get('section', 'Main')
                body += f"**[{i+1}] {source} ({section})**\n> {chunk['text'].strip()}\n\n"
        else:
            body += "No specific document passages matched the query in the local index.\n\n"

        for token in body.split(" "):
            yield token + " "
            await asyncio.sleep(0.01)

    async def stream_chat(
        self,
        messages: List[Dict[str, str]],
        context_chunks: List[Dict[str, Any]],
        biomarker_data: List[Dict[str, Any]]
    ) -> AsyncGenerator[str, None]:
        if not self.client:
            async for token in self._fallback_stream(messages, context_chunks, biomarker_data, "No active API key"):
                yield token
            return

        # Build context string
        context_str = "RETRIEVED CONTEXT:\n"
        for i, chunk in enumerate(context_chunks):
            source = chunk['metadata'].get('source', 'Unknown')
            section = chunk['metadata'].get('section', 'Unknown')
            context_str += f"[{i+1}] Source: {source} (Section: {section})\n{chunk['text']}\n\n"

        if biomarker_data:
            context_str += "BIOMARKER REFERENCE DATA:\n"
            for b in biomarker_data:
                opt_min = b.get('optimal_range', {}).get('min', 'N/A')
                opt_max = b.get('optimal_range', {}).get('max', 'N/A')
                ref_min = b.get('reference_range', {}).get('min', 'N/A')
                ref_max = b.get('reference_range', {}).get('max', 'N/A')
                unit = b.get('unit', '')
                context_str += f"- {b['name']} ({b['abbreviation']}): Optimal {opt_min}-{opt_max} {unit}, Reference {ref_min}-{ref_max} {unit}\n"

        system_prompt = self.build_system_prompt() + "\n\n" + context_str
        user_query = messages[-1]["content"] if messages else ""

        # Build conversation history for multi-turn
        from google.genai import types as genai_types
        history = []
        for msg in messages[:-1]:
            role = "user" if msg["role"] == "user" else "model"
            history.append(genai_types.Content(role=role, parts=[genai_types.Part(text=msg["content"])]))

        contents = history + [genai_types.Content(role="user", parts=[genai_types.Part(text=user_query)])]
        config = genai_types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.7,
            max_output_tokens=2048,
        )

        # Multi-model fallback loop
        last_error = None
        for model_candidate in self.candidate_models:
            try:
                response_iter = await asyncio.get_event_loop().run_in_executor(
                    None,
                    lambda m=model_candidate: self.client.models.generate_content_stream(
                        model=m,
                        contents=contents,
                        config=config
                    )
                )

                streamed_any = False
                for chunk in response_iter:
                    if chunk.text:
                        streamed_any = True
                        yield chunk.text
                        await asyncio.sleep(0)

                if streamed_any:
                    return

            except Exception as e:
                last_error = str(e)
                print(f"[LLMService] Model {model_candidate} error: {last_error}. Trying next candidate...")

        # If all candidates failed, retry once with the server key before offline mode
        server_client, server_key = resolve_gemini_client("")
        if server_client and server_client is not self.client:
            print("[LLMService] Retrying with server API key...")
            self.client = server_client
            self.api_key = server_key
            for model_candidate in self.candidate_models:
                try:
                    response_iter = await asyncio.get_event_loop().run_in_executor(
                        None,
                        lambda m=model_candidate: self.client.models.generate_content_stream(
                            model=m,
                            contents=contents,
                            config=config
                        )
                    )

                    streamed_any = False
                    for chunk in response_iter:
                        if chunk.text:
                            streamed_any = True
                            yield chunk.text
                            await asyncio.sleep(0)

                    if streamed_any:
                        return

                except Exception as e:
                    last_error = str(e)
                    print(f"[LLMService] Server key model {model_candidate} error: {last_error}")

        # If all candidates failed -> trigger offline stream
        print(f"[LLMService] All Gemini models failed. Triggering offline fallback.")
        async for token in self._fallback_stream(messages, context_chunks, biomarker_data, f"API Error: {last_error}"):
            yield token
