from django.db import models

from core.models import TimestampedModel


class SubmissionAnalysis(TimestampedModel):
    submission = models.OneToOneField(
        "submissions.DailySubmission",
        on_delete=models.CASCADE,
        related_name="analysis",
    )
    raw_transcript = models.TextField(blank=True)
    rewritten_version = models.TextField(
        blank=True, help_text="Higher-level rewrite of the transcript"
    )
    general_feedback = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "submission analyses"

    def __str__(self):
        return f"Analysis for submission #{self.submission_id}"


class Mistake(TimestampedModel):
    class Category(models.TextChoices):
        GRAMMAR = "grammar", "Grammar"
        VOCABULARY = "vocabulary", "Vocabulary"
        PRONUNCIATION = "pronunciation", "Pronunciation"
        TONE = "tone", "Tone"

    class Severity(models.TextChoices):
        MINOR = "minor", "Minor"
        MAJOR = "major", "Major"

    analysis = models.ForeignKey(
        SubmissionAnalysis, on_delete=models.CASCADE, related_name="mistakes"
    )
    original_text = models.TextField()
    correction = models.TextField()
    explanation = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices)
    severity = models.CharField(max_length=10, choices=Severity.choices)

    def __str__(self):
        return f"[{self.category}] {self.original_text[:40]} -> {self.correction[:40]}"
