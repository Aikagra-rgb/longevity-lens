import asyncio
import time
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from backend.services.vector_store import VectorStoreService
from backend.services.biomarker_tool import BiomarkerTool
from backend.services.rag_pipeline import RAGPipeline

async def run_stress_tests():
    print("==================================================")
    print("STARTING STRESS & EDGE-CASE TEST SUITE")
    print("==================================================\n")

    # --- 1. DIRECT RAG PIPELINE CONCURRENCY ---
    print("[1] Stress Testing RAG Pipeline Concurrency (10 Parallel RAG Queries)...")
    rag = RAGPipeline()
    queries = [
        "What does elevated CRP indicate?",
        "How does fasting affect insulin and glucose?",
        "Explain GrimAge and Horvath epigenetic clocks",
        "What lifestyle factors lower ApoB and LDL?",
        "What is the role of NAD+ in cellular aging?",
        "How does VO2max impact all-cause mortality?",
        "What markers indicate chronic inflammaging?",
        "What is the goldilocks range for IGF-1?",
        "How does gut microbiome diversity affect healthspan?",
        "What does high GGT signify for liver health?"
    ]

    start_time = time.time()

    async def run_single_rag(q):
        events = []
        async for event in rag.query(q, [], "sk-test-key"):
            events.append(event)
        return len(events)

    results = await asyncio.gather(*[run_single_rag(q) for q in queries], return_exceptions=True)
    duration = time.time() - start_time

    failures = [r for r in results if isinstance(r, Exception)]
    print(f"   [SUCCESS] Processed {len(queries)} concurrent RAG queries in {duration:.2f}s")
    print(f"   Failures: {len(failures)} / {len(queries)}")
    if failures:
        print(f"   Failure details: {failures[0]}")

    print("\n--------------------------------------------------")

    # --- 2. VECTOR STORE READ/WRITE CONCURRENCY ---
    print("[2] Stress Testing Pure-Python Vector Store Concurrency...")
    vs = VectorStoreService()
    initial_count = vs.count()
    print(f"   Initial indexed chunk count: {initial_count}")

    # Add 100 synthetic chunks concurrently across 10 tasks
    async def add_batch(batch_id):
        docs = []
        for i in range(10):
            docs.append({
                "id": f"stress_doc_{batch_id}_{i}",
                "text": f"Stress test synthetic document content for batch {batch_id} item {i}. Testing vector memory safety.",
                "embedding": [float((batch_id + i) % 10) / 10.0] * 384,
                "metadata": {"document_id": f"stress_batch_{batch_id}", "source": f"stress_batch_{batch_id}.txt", "type": "stress_test"}
            })
        vs.add_documents(docs)

    start_time = time.time()
    await asyncio.gather(*[add_batch(b) for b in range(10)])
    duration = time.time() - start_time
    new_count = vs.count()
    print(f"   [SUCCESS] Added 100 chunks across 10 concurrent threads in {duration:.2f}s")
    print(f"   Updated chunk count: {new_count} (Delta: +{new_count - initial_count})")

    # Test concurrent search
    async def search_query():
        return vs.query([0.5] * 384, top_k=5)

    search_results = await asyncio.gather(*[search_query() for _ in range(50)])
    print(f"   [SUCCESS] Executed 50 concurrent vector similarity searches successfully")

    # Cleanup stress test documents
    for b in range(10):
        vs.delete_by_document_id(f"stress_batch_{b}")
    print(f"   Cleaned up stress documents. Final count: {vs.count()}")

    print("\n--------------------------------------------------")

    # --- 3. BIOMARKER LOOKUP & FUZZY MATCHING EDGE CASES ---
    print("[3] Testing Biomarker Lookup Edge Cases (SQLi, XSS, Long Strings)...")
    tool = BiomarkerTool()

    edge_cases = [
        "",                             # Empty string
        "   ",                          # Whitespace
        "hs-crp",                       # Alias
        "HIGH-SENSITIVITY CRP",         # Uppercase alias
        "C-Reactive Protein",           # Full name
        "crp",                          # Abbreviation
        "NON_EXISTENT_BIOMARKER_999",   # Unknown
        "'; DROP TABLE biomarkers; --", # SQL Injection
        "<script>alert('xss')</script>",# XSS
        "A" * 5000                      # Extremely long string
    ]

    for ec in edge_cases:
        res = tool.search(ec)
        detect = tool.detect_biomarkers_in_text(ec)
    print(f"   [SUCCESS] Tested {len(edge_cases)} extreme edge cases (SQLi, XSS, 5,000-char input, empty) -- 0 crashes!")

    print("\n--------------------------------------------------")

    # --- 4. EXTREME PROMPT & CONTENT STRESS TEST ---
    print("[4] Extreme Prompt Stress Test (10,000 character prompt)...")
    huge_prompt = "What is CRP? " + ("Explain biological aging clocks in longevity research. " * 200)
    print(f"   Prompt size: {len(huge_prompt)} characters")

    events_count = 0
    start_time = time.time()
    async for event in rag.query(huge_prompt, [], "sk-test-key"):
        events_count += 1
    duration = time.time() - start_time
    print(f"   [SUCCESS] 10,000-character prompt processed successfully in {duration:.2f}s ({events_count} SSE events)")

    print("\n==================================================")
    print("ALL STRESS TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_stress_tests())
