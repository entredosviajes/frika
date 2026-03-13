import logging

from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_submission_task(self, submission_id: int):
    """Process an audio submission: transcribe, analyze, and save results."""
    from analysis.models import Mistake, SubmissionAnalysis
    from analysis.services import analyze_transcript, rewrite_native, transcribe_audio
    from submissions.models import DailySubmission

    submission = DailySubmission.objects.select_related(
        "user__profile"
    ).get(id=submission_id)

    try:
        submission.status = DailySubmission.Status.PROCESSING
        submission.save(update_fields=["status"])

        # Clean up any previous failed analysis
        SubmissionAnalysis.objects.filter(submission=submission).delete()

        # Step 1: Transcribe
        transcript = transcribe_audio(submission.audio_file.path)

        # Step 2: Analyze with Gemini Flash (grammar, mistakes, basic feedback)
        profile = submission.user.profile
        result = analyze_transcript(
            transcript=transcript,
            target_language=profile.target_language,
        )

        # Step 3: Rewrite with Gemini Pro (native-level rewrite)
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

        # Step 5: Save mistakes
        mistake_objects = []
        for m in result.get("mistakes", []):
            mistake_objects.append(
                Mistake(
                    analysis=analysis,
                    original_text=m["original_text"],
                    correction=m["correction"],
                    explanation=m["explanation"],
                    category=m["category"],
                    severity=m["severity"],
                )
            )
        created_mistakes = Mistake.objects.bulk_create(mistake_objects)

        # Step 6: Generate one exercise per mistake
        if created_mistakes:
            from curriculum.tasks import generate_exercises_for_mistakes

            generate_exercises_for_mistakes.delay(
                [m.id for m in created_mistakes],
                submission.user.id,
            )

        submission.status = DailySubmission.Status.COMPLETED
        submission.save(update_fields=["status"])

    except Exception as exc:
        logger.exception("Failed to process submission %s: %s", submission_id, exc)
        submission.status = DailySubmission.Status.FAILED
        submission.save(update_fields=["status"])
        raise exc
