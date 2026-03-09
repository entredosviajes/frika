import json
import logging
from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def _get_gemini_client():
    from google import genai

    return genai.Client(api_key=settings.GEMINI_API_KEY)


@shared_task
def generate_exercises_for_user(user_id: int):
    """Generate daily exercises targeting the user's weaknesses using Gemini Flash."""
    from curriculum.models import Exercise
    from progress.models import WeaknessTracker
    from users.models import User

    user = User.objects.select_related("profile").get(id=user_id)
    profile = user.profile
    tomorrow = (timezone.now() + timedelta(days=1)).date()

    # Don't generate if exercises already exist for tomorrow
    if Exercise.objects.filter(user=user, due_date=tomorrow).exists():
        logger.info("Exercises already exist for %s on %s", user.username, tomorrow)
        return

    # Get top weaknesses
    weaknesses = list(
        WeaknessTracker.objects.filter(user=user, resolved_at__isnull=True)
        .order_by("-error_count")[:5]
        .values_list("tag_name", flat=True)
    )

    if not weaknesses:
        weaknesses = ["grammar", "vocabulary"]

    client = _get_gemini_client()

    prompt = f"""You are a {profile.target_language} language coach for a {profile.proficiency_level} level student.

Generate 4 exercises targeting these weak areas: {', '.join(weaknesses)}.

Return a JSON array of exactly 4 objects. Each object must have:
- "type": one of "fill_blank", "grammar_fix", "translation", "rewrite"
- "content": an object with:
  - "instruction": what the student should do
  - "prompt": the sentence or text to work with
  - "answer": the correct answer

Mix the exercise types. Make them appropriate for {profile.proficiency_level} level.

Return ONLY valid JSON, no markdown fences."""

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    try:
        exercises_data = json.loads(response.text)
    except json.JSONDecodeError:
        logger.error("Failed to parse exercises from Gemini: %s", response.text)
        return

    for ex in exercises_data:
        Exercise.objects.create(
            user=user,
            type=ex["type"],
            content=ex["content"],
            due_date=tomorrow,
        )

    logger.info("Generated %d exercises for %s due %s", len(exercises_data), user.username, tomorrow)


@shared_task
def generate_weekly_exam(user_id: int):
    """Generate a weekly exam based on the user's top weaknesses using Gemini Pro."""
    from curriculum.models import Exam, ExamQuestion, Question, Topic
    from progress.models import WeaknessTracker
    from users.models import User

    user = User.objects.select_related("profile").get(id=user_id)
    profile = user.profile

    top_weaknesses = (
        WeaknessTracker.objects.filter(user=user, resolved_at__isnull=True)
        .order_by("-error_count")[:5]
        .values_list("tag_name", flat=True)
    )

    if not top_weaknesses:
        return

    client = _get_gemini_client()

    prompt = f"""Generate 10 quiz questions for a {profile.target_language} learner at {profile.proficiency_level} level.
Focus on these weak areas: {', '.join(top_weaknesses)}.

Return a JSON array of objects with:
- "text": the question text
- "topic": a short topic label

Return ONLY valid JSON, no markdown fences."""

    response = client.models.generate_content(
        model="gemini-2.5-pro",
        contents=prompt,
    )

    try:
        questions_data = json.loads(response.text)
    except (json.JSONDecodeError, IndexError):
        logger.error("Failed to parse exam questions from Gemini Pro")
        return

    now = timezone.now()
    exam = Exam.objects.create(
        user=user,
        start_date=now,
        end_date=now + timezone.timedelta(days=7),
    )

    for i, q_data in enumerate(questions_data):
        topic, _ = Topic.objects.get_or_create(name=q_data.get("topic", "General"))
        question = Question.objects.create(
            topic=topic,
            text=q_data["text"],
            proficiency_level=profile.proficiency_level,
        )
        ExamQuestion.objects.create(exam=exam, question=question, order=i)
