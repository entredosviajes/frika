from django.contrib import admin

from submissions.models import DailySubmission


@admin.register(DailySubmission)
class DailySubmissionAdmin(admin.ModelAdmin):
    list_display = ["user", "question", "status", "recorded_at"]
    list_filter = ["status"]
    search_fields = ["user__username"]
