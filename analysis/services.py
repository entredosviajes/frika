import json
import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def _use_mock():
    return not settings.OPENAI_API_KEY and not settings.ANTHROPIC_API_KEY


def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio file using OpenAI Whisper API."""
    if _use_mock():
        logger.info("Mock mode: returning fake transcript for %s", audio_path)
        return (
            "Yesterday I go to the store and buyed some foods. "
            "The weather was very good and I am feeling happy. "
            "I think that learning languages is very importance for my career."
        )

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
    if _use_mock():
        logger.info("Mock mode: returning fake analysis")
        return {
            "rewritten_version": (
                "Yesterday I went to the store and bought some groceries. "
                "The weather was wonderful, and I felt happy. "
                "I believe that learning languages is very important for my career."
            ),
            "general_feedback": (
                "Good effort! You communicate your ideas clearly. "
                "Focus on past tense verb forms and word choice to sound more natural."
            ),
            "mistakes": [
                {
                    "original_text": "I go to the store",
                    "correction": "I went to the store",
                    "explanation": "Use past tense 'went' instead of present tense 'go' when describing past events.",
                    "category": "grammar",
                    "severity": "major",
                },
                {
                    "original_text": "buyed some foods",
                    "correction": "bought some groceries",
                    "explanation": "'Buy' is an irregular verb — the past tense is 'bought', not 'buyed'. Also, 'groceries' is more natural than 'foods' in this context.",
                    "category": "vocabulary",
                    "severity": "major",
                },
                {
                    "original_text": "very importance",
                    "correction": "very important",
                    "explanation": "Use the adjective 'important' instead of the noun 'importance' after 'is very'.",
                    "category": "grammar",
                    "severity": "minor",
                },
            ],
        }

    import anthropic

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
