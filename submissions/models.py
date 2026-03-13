from django.db import models

from core.models import TimestampedModel


class DailySubmission(TimestampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        RETRYING = "retrying", "Retrying"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="submissions"
    )
    question = models.ForeignKey(
        "curriculum.Question", on_delete=models.SET_NULL, null=True, blank=True, related_name="submissions"
    )
    audio_file = models.FileField(upload_to="submissions/audio/%Y/%m/%d/")
    recorded_at = models.DateTimeField()
    duration = models.DurationField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    class Meta:
        ordering = ["-recorded_at"]

    def __str__(self):
        return f"{self.user.username} - {self.recorded_at.date()} ({self.status})"
