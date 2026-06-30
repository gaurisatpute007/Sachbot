import os
import json
import uuid
from datetime import datetime
from typing import List, Literal, Optional

from google import genai
from google.genai import types
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.models.store import claims_db

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from your .env file!")

router = APIRouter()
client = genai.Client(api_key=api_key)
MODEL_NAME = "gemini-2.5-flash"


# ── Structured output schema ──────────────────────────────────────────────────

class FactCheckResponse(BaseModel):
    verdict: Literal["FALSE", "MISLEADING", "UNVERIFIED", "TRUE"]
    confidence: int = Field(..., ge=0, le=100)
    claim: str
    explanation: str
    language: Literal["Hindi", "English", "Marathi", "Mixed", "Other"]
    category: Literal["Health", "Government Scheme", "Communal", "Election", "Economic", "Local", "Other"]
    safe_to_share: Optional[bool]
    risk_level: Literal["high", "medium", "low"]
    sources: List[str]
    needs_human_review: bool


def clean_schema(node):
    """
    Strip keys Gemini doesn't support — but NEVER remove 'type'.
    Removing 'type' leaves None where Gemini calls .upper(), causing
    AttributeError: 'NoneType' object has no attribute 'upper'.
    """
    # These are safe to remove — Gemini ignores or crashes on them
    UNSUPPORTED = {"title", "description", "$schema", "$defs",
                   "maximum", "minimum", "anyOf", "allOf", "oneOf", "not"}
    if isinstance(node, dict):
        return {
            k: clean_schema(v)
            for k, v in node.items()
            if k not in UNSUPPORTED
        }
    if isinstance(node, list):
        return [clean_schema(i) for i in node]
    return node


schema = clean_schema(FactCheckResponse.model_json_schema())


# ── Response text extractor ───────────────────────────────────────────────────

def extract_text(response) -> str:
    if hasattr(response, "text") and response.text:
        return response.text
    if hasattr(response, "output_text") and response.output_text:
        return response.output_text
    try:
        return response.candidates[0].content.parts[0].text
    except (AttributeError, IndexError, TypeError):
        pass
    raise ValueError(f"Cannot extract text from Gemini response: {response}")


# ── JSON repair ───────────────────────────────────────────────────────────────

def repair_json(raw: str) -> str:
    raw = raw.strip()
    try:
        json.loads(raw)
        return raw
    except json.JSONDecodeError:
        pass

    stack = []
    in_string = False
    escape_next = False

    for ch in raw:
        if escape_next:
            escape_next = False
            continue
        if ch == '\\' and in_string:
            escape_next = True
            continue
        if ch == '"':
            in_string = not in_string
            continue
        if in_string:
            continue
        if ch in ('{', '['):
            stack.append(ch)
        elif ch == '}' and stack and stack[-1] == '{':
            stack.pop()
        elif ch == ']' and stack and stack[-1] == '[':
            stack.pop()

    repaired = raw
    if in_string:
        repaired += '"'
    closers = {'{': '}', '[': ']'}
    for opener in reversed(stack):
        repaired += closers[opener]

    try:
        json.loads(repaired)
        return repaired
    except json.JSONDecodeError:
        pass

    last_comma = repaired.rfind(',')
    if last_comma != -1:
        trimmed = repaired[:last_comma]
        stack2, in_s2, esc2 = [], False, False
        for ch in trimmed:
            if esc2:             esc2 = False; continue
            if ch == '\\' and in_s2: esc2 = True; continue
            if ch == '"':        in_s2 = not in_s2; continue
            if in_s2:            continue
            if ch in ('{', '['): stack2.append(ch)
            elif ch == '}' and stack2 and stack2[-1] == '{': stack2.pop()
            elif ch == ']' and stack2 and stack2[-1] == '[': stack2.pop()
        for opener in reversed(stack2):
            trimmed += closers[opener]
        try:
            json.loads(trimmed)
            return trimmed
        except json.JSONDecodeError:
            pass

    return repaired


# ── Safe field defaults ───────────────────────────────────────────────────────

VALID_VERDICTS   = {"FALSE", "MISLEADING", "UNVERIFIED", "TRUE"}
VALID_LANGUAGES  = {"Hindi", "English", "Marathi", "Mixed", "Other"}
VALID_CATEGORIES = {"Health", "Government Scheme", "Communal", "Election",
                    "Economic", "Local", "Other"}
VALID_RISKS      = {"high", "medium", "low"}

def safe_get(d, key, default, valid_set=None):
    val = d.get(key, default)
    if val is None:
        return default
    if valid_set and val not in valid_set:
        return default
    return val


# ── Request model & prompt ────────────────────────────────────────────────────

class ClaimRequest(BaseModel):
    text: str
    language_hint: str = "auto"
    district: str = "Unknown"


PROMPT = """You are SachBot, an AI fact-checking assistant for India.
Analyze the forwarded WhatsApp message and evaluate its authenticity.
Be direct and use simple language a non-expert can understand.

You MUST respond with ONLY a single valid JSON object — no markdown, no code fences, no extra text.
Use exactly this shape:
{{
  "verdict": "FALSE" | "MISLEADING" | "UNVERIFIED" | "TRUE",
  "confidence": <integer 0-100>,
  "claim": "<one sentence extracting the core checkable claim>",
  "explanation": "<2-3 sentences explaining the verdict>",
  "language": "Hindi" | "English" | "Marathi" | "Mixed" | "Other",
  "category": "Health" | "Government Scheme" | "Communal" | "Election" | "Economic" | "Local" | "Other",
  "safe_to_share": true | false,
  "risk_level": "high" | "medium" | "low",
  "sources": [],
  "needs_human_review": true | false
}}

Forwarded message:
{text}"""


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/check")
async def check_claim(req: ClaimRequest):
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=PROMPT.format(text=req.text),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1,
                max_output_tokens=1200,
            ),
        )

        raw = extract_text(response).strip()
        print(f"[Gemini raw] {raw}")

        fixed = repair_json(raw)
        result = json.loads(fixed)

        verdict    = safe_get(result, "verdict",     "UNVERIFIED", VALID_VERDICTS)
        confidence = int(safe_get(result, "confidence", 50))
        category   = safe_get(result, "category",   "Other",      VALID_CATEGORIES)
        language   = safe_get(result, "language",   "Other",      VALID_LANGUAGES)
        risk       = safe_get(result, "risk_level",  "low",        VALID_RISKS)
        explanation = safe_get(result, "explanation", "Could not fully analyze this claim.")
        claim_text  = safe_get(result, "claim",       req.text[:120])
        sources     = result.get("sources") or []

        safe_to_share = result.get("safe_to_share")
        if verdict in ("FALSE", "MISLEADING"):
            safe_to_share = False

        needs_human_review = bool(result.get("needs_human_review", False))
        if confidence < 60 or category in ("Communal", "Election"):
            needs_human_review = True

        record = {
            "id":            str(uuid.uuid4())[:8],
            "text":          req.text,
            "language":      language,
            "category":      category,
            "district":      req.district,
            "verdict":       verdict,
            "confidence":    confidence,
            "explanation":   explanation,
            "claim":         claim_text,
            "safe_to_share": safe_to_share,
            "forwards":      1,
            "timestamp":     datetime.now().isoformat(),
            "status":        "pending" if needs_human_review else "verified",
            "risk":          risk,
            "sources":       sources,
        }

        claims_db.insert(0, record)
        return {"success": True, "result": record}

    except json.JSONDecodeError as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"JSON parse failed: {e}")
    except ValueError as e:
        import traceback; traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        import traceback; traceback.print_exc()
        err_str = str(e)
        if "RESOURCE_EXHAUSTED" in err_str or "429" in err_str:
            raise HTTPException(
                status_code=429,
                detail="SachBot has reached its daily AI quota for this demo. Please try again in a few minutes, or check back tomorrow once the quota resets."
            )
        raise HTTPException(status_code=500, detail=f"Internal error: {e}")


@router.get("/pipeline/{claim_id}")
async def get_pipeline(claim_id: str):
    claim = next((c for c in claims_db if c["id"] == claim_id), None)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    steps = [
        {"step": "receive",   "label": "Message received",      "done": True},
        {"step": "extract",   "label": "Claim extracted",       "done": True, "detail": claim.get("claim", "")},
        {"step": "language",  "label": "Language detected",     "done": True, "detail": claim.get("language", "")},
        {"step": "search",    "label": "Sources searched",      "done": True},
        {"step": "ai_reason", "label": "AI reasoning complete", "done": True},
        {"step": "human",     "label": "Human review",
         "done": claim["status"] == "verified",
         "detail": "Queued for review" if claim["status"] == "pending" else "Reviewed"},
        {"step": "respond",   "label": "Response sent",         "done": claim["status"] == "verified"},
    ]
    return {"claim": claim, "pipeline": steps}