import json
import logging

from celery import shared_task
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


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

    from google import genai

    client = genai.Client(api_key=settings.GEMINI_API_KEY)

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
