from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models import TimestampedModel


class User(AbstractUser):
    pass


class LearnerProfile(TimestampedModel):
    class ProficiencyLevel(models.TextChoices):
        A1 = "A1", "Beginner"
        A2 = "A2", "Elementary"
        B1 = "B1", "Intermediate"
        B2 = "B2", "Upper Intermediate"
        C1 = "C1", "Advanced"
        C2 = "C2", "Proficiency"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    target_language = models.CharField(max_length=50)
    proficiency_level = models.CharField(
        max_length=2,
        choices=ProficiencyLevel.choices,
        default=ProficiencyLevel.A1,
    )
    daily_streak = models.PositiveIntegerField(default=0)
    timezone = models.CharField(max_length=50, default="UTC")

    def __str__(self):
        return f"{self.user.username} - {self.target_language} ({self.proficiency_level})"
