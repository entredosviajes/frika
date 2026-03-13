import json
import logging
import re

from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)


def _clean_json_response(text: str) -> str:
    """Strip markdown fences and clean up common Gemini JSON issues."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _get_gemini_client():
    from google import genai

    return genai.Client(api_key=settings.GEMINI_API_KEY)


@shared_task
def generate_exercises_for_mistakes(mistake_ids: list[int], user_id: int):
    """Generate one exercise per mistake using Gemini Flash.

    Each exercise is tailored to the specific error the student made.
    """
    from analysis.models import Mistake
    from curriculum.models import Exercise
    from users.models import User

    user = User.objects.select_related("profile").get(id=user_id)
    profile = user.profile

    mistakes = Mistake.objects.filter(id__in=mistake_ids).select_related("analysis")

    # Skip mistakes that already have an exercise
    existing = set(
        Exercise.objects.filter(mistake__in=mistakes).values_list("mistake_id", flat=True)
    )
    mistakes = [m for m in mistakes if m.id not in existing]

    if not mistakes:
        return

    # Build a single prompt for all mistakes to minimize API calls
    mistakes_desc = []
    for i, m in enumerate(mistakes):
        mistakes_desc.append(
            f'{i + 1}. Category: {m.category}, '
            f'Original: "{m.original_text}", '
            f'Correction: "{m.correction}", '
            f'Explanation: {m.explanation}'
        )

    client = _get_gemini_client()

    prompt = f"""You are a {profile.target_language} language coach.

The student made the following mistakes in a speaking exercise:

{chr(10).join(mistakes_desc)}

For EACH mistake, generate exactly one creative exercise that targets the same linguistic concept WITHOUT copying the original sentence. The student should not be able to guess the answer just by remembering what they said.

Return a JSON array of {len(mistakes)} objects (one per mistake, same order). Each object must have:
- "type": one of "fill_blank", "grammar_fix", "translation", "rewrite" — pick the most appropriate type for the mistake
- "content": an object with:
  - "instruction": a clear, concise instruction (do NOT mention the original mistake or the correct answer)
  - "prompt": a completely new sentence or text that tests the same linguistic concept (must be different from the original recording)
  - "answer": the correct answer

Be creative. Use different topics, contexts, and vocabulary while testing the exact same grammar rule or vocabulary pattern."""

    from google.genai import types

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    try:
        exercises_data = json.loads(_clean_json_response(response.text))
    except json.JSONDecodeError:
        logger.error("Failed to parse exercises from Gemini: %s", response.text)
        return

    for mistake, ex_data in zip(mistakes, exercises_data):
        Exercise.objects.create(
            user=user,
            mistake=mistake,
            type=ex_data["type"],
            content=ex_data["content"],
        )

    logger.info("Generated %d exercises for %s", len(mistakes), user.username)
