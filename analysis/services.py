import json
import logging
import re

from django.conf import settings

logger = logging.getLogger(__name__)


def _clean_json_response(text: str) -> str:
    """Strip markdown fences and clean up common Gemini JSON issues."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _use_mock():
    return not settings.GEMINI_API_KEY


def _get_gemini_client():
    from google import genai

    return genai.Client(api_key=settings.GEMINI_API_KEY)


def transcribe_audio(audio_path: str) -> str:
    """Transcribe audio file using Gemini Flash (native audio ingestion)."""
    if _use_mock():
        logger.info("Mock mode: returning fake transcript for %s", audio_path)
        return (
            "Yesterday I go to the store and buyed some foods. "
            "The weather was very good and I am feeling happy. "
            "I think that learning languages is very importance for my career."
        )

    client = _get_gemini_client()

    with open(audio_path, "rb") as f:
        audio_data = f.read()

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            {
                "parts": [
                    {"inline_data": {"mime_type": "audio/webm", "data": audio_data}},
                    {"text": "Transcribe this audio recording exactly as spoken. Return only the transcription text, nothing else."},
                ]
            }
        ],
    )

    return response.text.strip()


def analyze_transcript(transcript: str, target_language: str) -> dict:
    """Analyze a transcript using Gemini Flash for grammar/mistakes.

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

    client = _get_gemini_client()

    prompt = f"""You are an expert {target_language} language coach. A student recorded themselves speaking. Here is their transcript:

---
{transcript}
---

Analyze this transcript and return a JSON object with:
1. "rewritten_version": Rewrite the transcript so it sounds natural and fluent while keeping the same meaning.
2. "general_feedback": 2-3 sentences of encouraging, constructive feedback.
3. "mistakes": An array of objects, each with:
   - "original_text": the segment containing the error
   - "correction": the corrected version
   - "explanation": why this is wrong and how to fix it
   - "category": one of "grammar", "vocabulary", "pronunciation", "tone"
   - "severity": one of "minor", "major"

Return ONLY valid JSON, no markdown fences."""

    from google.genai import types

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    cleaned = _clean_json_response(response.text)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.error("Failed to parse Gemini Flash response: %s", response.text)
        raise


def rewrite_native(transcript: str, target_language: str) -> str:
    """Rewrite a transcript at native level using Gemini Pro."""
    if _use_mock():
        return (
            "Yesterday I went to the store and bought some groceries. "
            "The weather was wonderful, and I felt happy. "
            "I believe that learning languages is very important for my career."
        )

    client = _get_gemini_client()

    prompt = f"""You are a native {target_language} speaker and expert language coach.

Rewrite the following transcript so it sounds like a natural, fluent native speaker wrote it. Preserve the original meaning and intent, but use idiomatic expressions, natural phrasing, appropriate register, and cultural nuance.

Transcript:
---
{transcript}
---

Return ONLY the rewritten text, nothing else."""

    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt,
    )

    return response.text.strip()


def validate_exercise_answer(exercise, user_answer: str, target_language: str) -> str:
    """Validate a user's exercise answer using Gemini Flash.

    Returns a feedback string explaining whether the answer is acceptable.
    """
    if _use_mock():
        return "Good attempt! Your answer is acceptable."

    client = _get_gemini_client()
    content = exercise.content if isinstance(exercise.content, dict) else json.loads(exercise.content)

    prompt = f"""You are a {target_language} language coach evaluating a student's exercise answer.

Exercise type: {exercise.type}
Instruction: {content.get('instruction', '')}
Prompt: {content.get('prompt', '')}
Expected answer: {content.get('answer', '')}
Student's answer: {user_answer}

Evaluate whether the student's answer is acceptable. It doesn't need to be identical to the expected answer — it just needs to be linguistically correct and fulfill the instruction.

Respond with a short evaluation (2-3 sentences):
- If correct or acceptable: confirm it's right and briefly explain why.
- If partially correct: acknowledge what's right and explain what could be improved.
- If incorrect: explain the issue clearly and give the correct form.

Return ONLY the feedback text, nothing else."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    return response.text.strip()
