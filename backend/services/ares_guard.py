"""ARES Level-2 Runtime Security & Prompt Optimization Guard for LongevityLens."""

from __future__ import annotations

from dataclasses import dataclass
import json
import logging
import os
import re
from typing import AsyncGenerator, Optional

import httpx

from backend.config import (
    ARES_API_KEY,
    ARES_APP_NAME,
    ARES_CANARY_TOKEN,
    ARES_FAIL_CLOSED,
    ARES_GATEWAY_URL,
    ARES_OPTIMIZE_PROMPTS,
    ARES_ORG_ID,
)

logger = logging.getLogger(__name__)

_OUTBOUND_REDACTION_MARKER = "[REDACTED BY ARES OUTBOUND SHIELD]"


def _read_str_env(name: str, default: str) -> str:
    raw = os.getenv(name)
    return (default if raw is None else raw).strip()


def _read_bool_env(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return bool(default)
    return raw.strip().lower() in ("1", "true", "yes")


def _longest_canary_prefix_suffix(text: str, canary: str) -> int:
    """Return length of longest suffix of `text` that matches a prefix of `canary` (case-insensitive)."""
    if not text or not canary:
        return 0
    lower_text = text.lower()
    lower_canary = canary.lower()
    max_k = min(len(lower_text), len(lower_canary) - 1)
    for k in range(max_k, 0, -1):
        if lower_text.endswith(lower_canary[:k]):
            return k
    return 0


@dataclass
class AresGuardDecision:
    """Inbound ARES security + optimization decision for a chat query."""

    allowed: bool
    action: str
    effective_query: str
    risk_score: int = 0
    matched_technique: Optional[str] = None
    explanation: str = ""
    optimized: bool = False


class AresGuard:
    """Client-side runtime integration connecting LongevityLens to ARES Gateway & Optimizer."""

    def __init__(self, transport: Optional[httpx.AsyncBaseTransport] = None) -> None:
        self.transport = transport

    def _runtime_settings(self) -> dict:
        return {
            "gateway_url": _read_str_env("ARES_GATEWAY_URL", ARES_GATEWAY_URL),
            "api_key": _read_str_env("ARES_API_KEY", ARES_API_KEY),
            "org_id": _read_str_env("ARES_ORG_ID", ARES_ORG_ID) or "org_longevity_lens",
            "app_name": _read_str_env("ARES_APP_NAME", ARES_APP_NAME) or "LongevityLensCopilot",
            "canary_token": _read_str_env("ARES_CANARY_TOKEN", ARES_CANARY_TOKEN),
            "optimize_prompts": _read_bool_env("ARES_OPTIMIZE_PROMPTS", ARES_OPTIMIZE_PROMPTS),
            "fail_closed": _read_bool_env("ARES_FAIL_CLOSED", ARES_FAIL_CLOSED),
        }

    async def inspect_inbound(self, query: str) -> AresGuardDecision:
        """Evaluate an inbound prompt via local canary backstop and ARES `/api/v1/gateway/enforce`."""
        cfg = self._runtime_settings()
        canary_token = cfg["canary_token"]
        if canary_token and canary_token.lower() in (query or "").lower():
            return AresGuardDecision(
                allowed=False,
                action="BLOCK",
                effective_query=query,
                risk_score=98,
                matched_technique="canary_leak_attempt",
                explanation="Blocked by local ARES canary backstop.",
            )

        gateway_url = cfg["gateway_url"].rstrip("/")
        if not gateway_url:
            return AresGuardDecision(
                allowed=True,
                action="ALLOW",
                effective_query=query,
            )

        headers = {
            "X-Ares-Api-Key": cfg["api_key"],
            "X-Ares-Organization-Id": cfg["org_id"],
        }
        payload = {
            "prompt": query,
            "application_name": cfg["app_name"],
        }

        try:
            async with httpx.AsyncClient(timeout=5.0, transport=self.transport) as client:
                resp = await client.post(
                    f"{gateway_url}/api/gateway/enforce",
                    json=payload,
                    headers=headers,
                )
                resp.raise_for_status()
                data = resp.json() if resp.content else {}

                action = str(data.get("action") or "ALLOW").upper()
                risk_score = int(data.get("risk_score") or 0)
                matched_technique = data.get("matched_technique")
                explanation = str(data.get("explanation") or "")

                if action == "BLOCK":
                    return AresGuardDecision(
                        allowed=False,
                        action="BLOCK",
                        effective_query=query,
                        risk_score=risk_score,
                        matched_technique=matched_technique,
                        explanation=explanation,
                    )

                if action == "SANITIZE":
                    effective = str(data.get("sanitized_prompt") or query)
                    return AresGuardDecision(
                        allowed=True,
                        action="SANITIZE",
                        effective_query=effective,
                        risk_score=risk_score,
                        matched_technique=matched_technique,
                        explanation=explanation,
                    )

                effective = query
                optimized = False
                if cfg["optimize_prompts"] and len(effective) >= 160:
                    try:
                        opt_resp = await client.post(
                            f"{gateway_url}/api/v1/optimizer/optimize",
                            json={
                                "prompt": effective,
                                "org_id": cfg["org_id"],
                                "prefer_rule_compression": True,
                            },
                            headers=headers,
                        )
                        if opt_resp.status_code == 200:
                            opt_data = opt_resp.json() or {}
                            if (
                                opt_data.get("status") == "optimized"
                                and opt_data.get("verification_passed") is True
                                and opt_data.get("optimized_prompt")
                            ):
                                effective = str(opt_data["optimized_prompt"])
                                optimized = True
                    except Exception as opt_exc:
                        logger.warning("ARES prompt optimization skipped: %s", opt_exc)

                return AresGuardDecision(
                    allowed=True,
                    action="ALLOW",
                    effective_query=effective,
                    risk_score=risk_score,
                    matched_technique=matched_technique,
                    explanation=explanation,
                    optimized=optimized,
                )
        except Exception as exc:
            logger.warning("ARES gateway check failed (%s)", exc)
            if cfg["fail_closed"]:
                return AresGuardDecision(
                    allowed=False,
                    action="BLOCK",
                    effective_query=query,
                    risk_score=90,
                    matched_technique="ares_gateway_unavailable",
                    explanation="ARES gateway unreachable and ARES_FAIL_CLOSED=true.",
                )
            return AresGuardDecision(
                allowed=True,
                action="ALLOW",
                effective_query=query,
                explanation="ARES gateway unavailable; fail-open policy active.",
            )

    def _redact_canary(self, text: str, canary_token: str) -> str:
        if not text or not canary_token:
            return text
        return re.sub(
            re.escape(canary_token),
            _OUTBOUND_REDACTION_MARKER,
            text,
            flags=re.IGNORECASE,
        )

    async def filter_sse_stream(
        self,
        sse_events: AsyncGenerator[str, None],
    ) -> AsyncGenerator[str, None]:
        """Inspect outbound SSE token chunks across boundaries and redact any canary disclosure."""
        canary_token = _read_str_env("ARES_CANARY_TOKEN", ARES_CANARY_TOKEN)
        pending = ""

        async for block in sse_events:
            event_name: Optional[str] = None
            data_str: Optional[str] = None
            for line in block.splitlines():
                stripped = line.strip()
                if stripped.startswith("event:"):
                    event_name = stripped[6:].strip().lower()
                elif stripped.startswith("data:"):
                    data_str = stripped[5:].strip()

            if event_name == "token" and data_str is not None:
                try:
                    payload = json.loads(data_str)
                except Exception:
                    payload = None
                if isinstance(payload, dict) and "content" in payload:
                    chunk_text = str(payload["content"])
                    if not canary_token:
                        yield block
                        continue
                    pending += chunk_text
                    pending = self._redact_canary(pending, canary_token)
                    hold_len = _longest_canary_prefix_suffix(pending, canary_token)
                    emit_len = len(pending) - hold_len
                    if emit_len > 0:
                        to_emit = pending[:emit_len]
                        pending = pending[emit_len:]
                        yield f"event: token\ndata: {json.dumps({'content': to_emit})}\n\n"
                    continue

            if pending:
                flushed = self._redact_canary(pending, canary_token)
                pending = ""
                if flushed:
                    yield f"event: token\ndata: {json.dumps({'content': flushed})}\n\n"

            yield self._redact_canary(block, canary_token) if canary_token else block

        if pending:
            flushed = self._redact_canary(pending, canary_token)
            if flushed:
                yield f"event: token\ndata: {json.dumps({'content': flushed})}\n\n"

    async def blocked_sse_stream(
        self,
        decision: AresGuardDecision,
    ) -> AsyncGenerator[str, None]:
        """Emit a well-formed SSE stream announcing an ARES security gateway block."""
        tech = decision.matched_technique or "policy_violation"
        msg = (
            f"> **ARES Security Gateway (`BLOCK`, risk={decision.risk_score}/100, "
            f"technique=`{tech}`)**: Request blocked before reaching the RAG/LLM pipeline.\n"
        )
        yield f"event: token\ndata: {json.dumps({'content': msg})}\n\n"
        yield f"event: citations\ndata: {json.dumps({'citations': []})}\n\n"
        yield "event: done\ndata: {}\n\n"
