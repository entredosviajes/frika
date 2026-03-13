from django.db import models

from core.models import TimestampedModel


class Topic(TimestampedModel):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Question(TimestampedModel):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField()
    proficiency_level = models.CharField(max_length=2, blank=True)

    def __str__(self):
        return self.text[:80]


class Exercise(TimestampedModel):
    class ExerciseType(models.TextChoices):
        FILL_IN_BLANK = "fill_blank", "Fill in the Blank"
        GRAMMAR_FIX = "grammar_fix", "Grammar Fix"
        TRANSLATION = "translation", "Translation"
        REWRITE = "rewrite", "Rewrite"

    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="exercises"
    )
    type = models.CharField(max_length=20, choices=ExerciseType.choices)
    content = models.JSONField()
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.type} for {self.user.username}"


class Exam(TimestampedModel):
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, related_name="exams"
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    score = models.FloatField(null=True, blank=True)
    questions = models.ManyToManyField(Question, through="ExamQuestion", blank=True)

    def __str__(self):
        return f"Exam for {self.user.username} ({self.start_date.date()})"


class ExamQuestion(TimestampedModel):
    """Through model to track per-question scores on exams."""

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user_answer = models.TextField(blank=True)
    score = models.FloatField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        unique_together = ("exam", "question")
