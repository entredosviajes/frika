import logging

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_submission_task(self, submission_id: int):
    """Process an audio submission: transcribe, analyze, and save results."""
    from analysis.models import Mistake, SubmissionAnalysis
    from analysis.services import analyze_transcript, rewrite_native, transcribe_audio
    from progress.models import WeaknessTracker
    from submissions.models import DailySubmission

    submission = DailySubmission.objects.select_related(
        "user__profile", "question"
    ).get(id=submission_id)

    try:
        submission.status = DailySubmission.Status.PROCESSING
        submission.save(update_fields=["status"])

        # Step 1: Transcribe
        transcript = transcribe_audio(submission.audio_file.path)

        # Step 2: Analyze with Gemini Flash (grammar, mistakes, basic feedback)
        profile = submission.user.profile
        result = analyze_transcript(
            transcript=transcript,
            target_language=profile.target_language,
            proficiency_level=profile.proficiency_level,
        )

        # Step 3: Rewrite with Gemini Pro (native C2-level rewrite)
        rewritten = rewrite_native(
            transcript=transcript,
            target_language=profile.target_language,
        )

        # Step 4: Save analysis
        analysis = SubmissionAnalysis.objects.create(
            submission=submission,
            raw_transcript=transcript,
            rewritten_version=rewritten,
            general_feedback=result.get("general_feedback", ""),
        )

        # Step 4: Save mistakes
        mistakes = []
        for m in result.get("mistakes", []):
            mistakes.append(
                Mistake(
                    analysis=analysis,
                    original_text=m["original_text"],
                    correction=m["correction"],
                    explanation=m["explanation"],
                    category=m["category"],
                    severity=m["severity"],
                )
            )
        Mistake.objects.bulk_create(mistakes)

        # Step 5: Update weakness tracker
        now = timezone.now()
        for m in result.get("mistakes", []):
            tracker, created = WeaknessTracker.objects.get_or_create(
                user=submission.user,
                tag_name=m["category"],
                defaults={"error_count": 1, "last_occurrence": now},
            )
            if not created:
                tracker.error_count += 1
                tracker.last_occurrence = now
                tracker.resolved_at = None
                tracker.save(update_fields=["error_count", "last_occurrence", "resolved_at"])

        submission.status = DailySubmission.Status.COMPLETED
        submission.save(update_fields=["status"])

    except Exception as exc:
        logger.exception("Failed to process submission %s: %s", submission_id, exc)
        submission.status = DailySubmission.Status.FAILED
        submission.save(update_fields=["status"])
        raise exc
