from openai import AsyncOpenAI
from backend.config import CHAT_MODEL
from typing import List, Dict, Any, AsyncGenerator
import asyncio

class LLMService:
    """
    LLMService class for interacting with OpenAI Chat API with graceful fallback handling.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = CHAT_MODEL
        self.client = None
        if api_key and not api_key.startswith("your-"):
            try:
                self.client = AsyncOpenAI(api_key=api_key)
            except Exception:
                self.client = None

    def build_system_prompt(self) -> str:
        """
        Build the system prompt for the health research assistant persona.
        """
        return """You are LongevityLens — a Health & Longevity Research Copilot powered by RAG (Retrieval-Augmented Generation).

Your role is to help researchers, clinicians, and health-conscious individuals explore longevity biomarker data and published research findings.

CRITICAL INSTRUCTIONS:
1. DISCLAIMER: Always include a brief note that this information is for educational and informational purposes only and does NOT constitute medical advice.
2. CITATIONS: Cite your sources using [1], [2], etc., matching the numbered context passages provided below.
3. BIOMARKERS: When biomarker reference data is provided, incorporate reference ranges, optimal ranges, and lifestyle factors.
4. TONE: Professional, evidence-based scientific tone.
"""

    async def _fallback_stream(self, messages: List[Dict[str, str]], context_chunks: List[Dict[str, Any]], biomarker_data: List[Dict[str, Any]], error_msg: str) -> AsyncGenerator[str, None]:
        """
        Generates a structured research response directly from retrieved RAG context when OpenAI API quota is exceeded.
        """
        user_query = messages[-1]["content"] if messages else "health query"
        
        header = f"> ℹ️ **Notice**: *OpenAI API returned quota limits ({error_msg}). LongevityLens is responding in **Offline Research Mode** using local RAG context retrieval and pre-loaded biomarker datasets.*\n\n"
        for char in header:
            yield char
            await asyncio.sleep(0.002)

        disclaimer = "⚠️ **Disclaimer**: *This research copilot provides educational and informational summary data only. It is not medical advice. Consult a healthcare provider for medical decisions.*\n\n"
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
                    inc = b['lifestyle_factors'].get('increases', [])
                    dec = b['lifestyle_factors'].get('decreases', [])
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

    async def stream_chat(self, messages: List[Dict[str, str]], context_chunks: List[Dict[str, Any]], biomarker_data: List[Dict[str, Any]]) -> AsyncGenerator[str, None]:
        """
        Stream chat response using OpenAI API, with automatic fallback if quota is exceeded.
        """
        if not self.client:
            async for token in self._fallback_stream(messages, context_chunks, biomarker_data, "No active API key"):
                yield token
            return

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

        sys_prompt = self.build_system_prompt() + "\n\n" + context_str

        api_messages = [{"role": "system", "content": sys_prompt}]
        for msg in messages:
            api_messages.append({"role": msg["role"], "content": msg["content"]})

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=api_messages,
                stream=True
            )

            async for chunk in response:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if delta.content:
                        yield delta.content

        except Exception as e:
            error_str = str(e)
            print(f"[LLMService] OpenAI streaming error, switching to fallback mode: {error_str}")
            async for token in self._fallback_stream(messages, context_chunks, biomarker_data, "Quota Limit Exceeded"):
                yield token
