from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models import TimestampedModel


class User(AbstractUser):
    pass


class LearnerProfile(TimestampedModel):
    class SourceLanguage(models.TextChoices):
        EN = "en", "English"
        FR = "fr", "French"
        AR = "ar", "Arabic"
        ES = "es", "Spanish"

    class TargetLanguage(models.TextChoices):
        EN = "en", "English"
        FR = "fr", "French"
        AR = "ar", "Arabic"
        ES = "es", "Spanish"
        IT = "it", "Italian"
        DE = "de", "German"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    target_language = models.CharField(
        max_length=10,
        choices=TargetLanguage.choices,
        default=TargetLanguage.EN,
    )
    source_language = models.CharField(
        max_length=10,
        choices=SourceLanguage.choices,
        default=SourceLanguage.EN,
    )
    timezone = models.CharField(max_length=50, default="UTC")

    def __str__(self):
        return f"{self.user.username} - {self.target_language}"
