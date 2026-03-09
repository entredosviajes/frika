import json
import logging

import anthropic
from django.conf import settings

logger = logging.getLogger(__name__)


def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio file using OpenAI Whisper API."""
    import openai

    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    with open(audio_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
        )
    return transcript.text


def analyze_transcript(transcript: str, target_language: str, proficiency_level: str) -> dict:
    """Analyze a transcript using Claude for linguistic feedback.

    Returns a dict with keys:
        - rewritten_version: str
        - general_feedback: str
        - mistakes: list[dict] with keys:
            original_text, correction, explanation, category, severity
    """
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

    prompt = f"""You are an expert {target_language} language coach. A student at {proficiency_level} level recorded themselves speaking. Here is their transcript:

---
{transcript}
---

Analyze this transcript and return a JSON object with:
1. "rewritten_version": Rewrite the transcript at a higher proficiency level while keeping the same meaning.
2. "general_feedback": 2-3 sentences of encouraging, constructive feedback.
3. "mistakes": An array of objects, each with:
   - "original_text": the segment containing the error
   - "correction": the corrected version
   - "explanation": why this is wrong and how to fix it
   - "category": one of "grammar", "vocabulary", "pronunciation", "tone"
   - "severity": one of "minor", "major"

Return ONLY valid JSON, no markdown fences."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    try:
        return json.loads(message.content[0].text)
    except (json.JSONDecodeError, IndexError):
        logger.error("Failed to parse Claude response: %s", message.content)
        raise
