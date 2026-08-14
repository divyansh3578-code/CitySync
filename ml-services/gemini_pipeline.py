"""
gemini_pipeline.py

CivicSeva AI pipeline using ONLY the Gemini API -- no trained model, no
dataset. A single multimodal call handles all three requirements:

    1. Wrong image upload      -> "status": "INVALID_IMAGE"
    2. Category -> department  -> "department": Roadways / Waterways / Other
    3. Severity                -> "severity": LOW / MEDIUM / HIGH / CRITICAL

Setup:
    pip install google-genai pydantic
    export GEMINI_API_KEY="your_key_here"   # get free key at aistudio.google.com

Usage (standalone test):
    python gemini_pipeline.py --image test.jpg --text "Large pothole blocking the road"
"""

import argparse
import json
import os
import time
from enum import Enum
from typing import Optional

from dotenv import load_dotenv
from google import genai
from google.genai import errors as genai_errors
from pydantic import BaseModel, Field

load_dotenv()  # reads .env in the current folder and loads it into os.environ

# --- Config -------------------------------------------------------------

MODEL_NAME = "gemini-3.5-flash"   # free-tier model as of Aug 2026 (15 RPM, 1500 RPD).
                                    # gemini-2.5-flash is closed to new API keys and
                                    # shuts down entirely Oct 16, 2026. If THIS model
                                    # also 404s by the time you read this, check
                                    # https://aistudio.google.com for the current
                                    # free-tier model name and swap it in here.

MAX_RETRIES = 3
RETRY_BASE_DELAY = 5  # seconds, doubles each retry (handles 429 rate limits)


# --- Response schema (Gemini fills this in directly, no manual parsing) --

class Department(str, Enum):
    ROADWAYS = "Roadways"
    WATERWAYS = "Waterways / Drainage"
    SANITATION = "Sanitation / Other"
    NOT_APPLICABLE = "N/A"


class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    NOT_APPLICABLE = "N/A"


class ComplaintAnalysis(BaseModel):
    is_valid_civic_image: bool = Field(
        description="False if the image does NOT show a genuine civic infrastructure "
        "problem (e.g. it's a selfie, random object, food, unrelated scene, or a "
        "duplicate/joke upload)."
    )
    rejection_reason: Optional[str] = Field(
        default=None,
        description="If is_valid_civic_image is False, a short reason why (e.g. "
        "'Image shows a person, not an infrastructure issue').",
    )
    problem: Optional[str] = Field(
        default=None, description="Short name of the detected problem, e.g. 'Pothole', "
        "'Garbage dumping', 'Waterlogging', 'Broken streetlight'."
    )
    department: Department = Field(description="Which civic department this belongs to.")
    confidence: float = Field(description="Model's confidence in this classification, 0 to 1.")
    severity: Severity = Field(description="Severity of the issue.")
    severity_score: int = Field(description="Severity score from 0 (none) to 100 (critical), "
                                 "matching the severity label.")
    reasoning: str = Field(description="One sentence explaining the severity assessment, "
                            "referencing what's visible in the image and/or the text.")


SYSTEM_PROMPT = """You are the AI classification engine for CivicSeva, a citizen \
civic-complaint platform. You will be shown a photo a citizen uploaded, along with \
their text description of the problem.

Your job, in one pass:

1. VALIDATE: Check whether the image actually shows a real civic infrastructure \
problem (potholes/road damage, garbage/waste dumping, waterlogging/drainage issues, \
broken streetlights, damaged public property, etc). If the image is irrelevant \
(selfies, random objects, food, pets, screenshots, memes, or anything unrelated to \
a civic issue), set is_valid_civic_image to false and explain why in rejection_reason. \
Do NOT guess a department or severity for invalid images -- use "N/A" for both.

2. CATEGORIZE: If valid, identify the specific problem and map it to exactly one \
department:
   - Roadways: potholes, road damage, broken pavement, cracked roads,traffic
   - Waterways / Drainage: waterlogging, flooding, blocked drains, sewage overflow
   - Sanitation / Other: garbage/waste dumping, broken streetlights, damaged public \
property, anything else civic-related that isn't roads or water

3. ASSESS SEVERITY: Based on both the image and the citizen's text, score severity \
0-100 and assign a label:
   - LOW (0-29): minor, cosmetic, no safety risk
   - MEDIUM (30-54): noticeable problem, inconvenience, no immediate danger
   - HIGH (55-79): significant hazard, affecting traffic/access/health, needs prompt action
   - CRITICAL (80-100): immediate danger to life/property, needs urgent response

Be conservative and honest -- do not inflate severity, and do not force a \
classification onto an image that doesn't clearly show a civic problem. Citizens \
may exaggerate in their text description; weigh the actual image content more \
heavily than the text when they disagree."""


# --- Core pipeline function ---------------------------------------------

def analyze_complaint(image_path: str, text_description: str = "") -> dict:
    """Send image + text to Gemini and get back the full classification in
    one call. Retries on rate-limit (429) errors with exponential backoff."""

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY not set. Get a free key at https://aistudio.google.com/apikey "
            "and run: export GEMINI_API_KEY='your_key_here'"
        )

    client = genai.Client(api_key=api_key)

    with open(image_path, "rb") as f:
        image_bytes = f.read()

    mime_type = "image/png" if image_path.lower().endswith(".png") else "image/jpeg"

    user_prompt = (
        f"Citizen's text description: \"{text_description or '(no description provided)'}\"\n\n"
        "Analyze the attached image and the description above according to your instructions."
    )

    last_error = None
    for attempt in range(MAX_RETRIES):
        try:
            response = client.models.generate_content(
                model=MODEL_NAME,
                contents=[
                    {"role": "user", "parts": [
                        {"text": user_prompt},
                        {"inline_data": {"mime_type": mime_type, "data": image_bytes}},
                    ]}
                ],
                config={
                    "system_instruction": SYSTEM_PROMPT,
                    "response_mime_type": "application/json",
                    "response_schema": ComplaintAnalysis,
                    "temperature": 0.1,  # low temperature: consistent, non-creative classification
                },
            )
            result: ComplaintAnalysis = response.parsed
            return _format_output(result)

        except genai_errors.APIError as e:
            last_error = e
            # 429 = rate limit hit; back off and retry. Anything else, fail fast.
            if getattr(e, "code", None) == 429 and attempt < MAX_RETRIES - 1:
                delay = RETRY_BASE_DELAY * (2 ** attempt)
                print(f"Rate limited, retrying in {delay}s... (attempt {attempt + 1}/{MAX_RETRIES})")
                time.sleep(delay)
                continue
            break

    # All retries exhausted or a non-retryable error occurred.
    return {
        "status": "ERROR",
        "message": f"Gemini API call failed: {last_error}",
    }


def _format_output(result: ComplaintAnalysis) -> dict:
    if not result.is_valid_civic_image:
        return {
            "status": "INVALID_IMAGE",
            "message": result.rejection_reason or "Image does not show a valid civic problem.",
        }

    return {
        "status": "VALID",
        "problem": result.problem,
        "department": result.department.value,
        "confidence": round(result.confidence, 3),
        "severity": result.severity.value,
        "severity_score": result.severity_score,
        "reasoning": result.reasoning,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=str, required=True)
    parser.add_argument("--text", type=str, default="")
    args = parser.parse_args()

    result = analyze_complaint(args.image, args.text)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()