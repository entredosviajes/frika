from django.db import models

from core.models import TimestampedModel


class WeaknessTracker(TimestampedModel):
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="weaknesses"
    )
    tag_name = models.CharField(max_length=100)
    error_count = models.PositiveIntegerField(default=0)
    last_occurrence = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("user", "tag_name")

    def __str__(self):
        return f"{self.user.username} - {self.tag_name} ({self.error_count})"


class WeeklyReport(TimestampedModel):
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="weekly_reports"
    )
    week_start = models.DateField()
    week_end = models.DateField()
    total_submissions = models.PositiveIntegerField(default=0)
    total_mistakes = models.PositiveIntegerField(default=0)
    top_weaknesses = models.JSONField(default=list)
    streak = models.PositiveIntegerField(default=0)
    summary = models.TextField(blank=True)

    class Meta:
        ordering = ["-week_start"]

    def __str__(self):
        return f"Report for {self.user.username} ({self.week_start} - {self.week_end})"
