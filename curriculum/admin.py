from django.contrib import admin

from curriculum.models import Exam, ExamQuestion, Exercise, Question, Topic


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["text", "topic", "proficiency_level"]
    list_filter = ["topic", "proficiency_level"]


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ["user", "type", "is_completed", "created_at"]
    list_filter = ["type", "is_completed"]


class ExamQuestionInline(admin.TabularInline):
    model = ExamQuestion
    extra = 0


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ["user", "start_date", "end_date", "score"]
    inlines = [ExamQuestionInline]
