from django.contrib import admin

from analysis.models import Mistake, SubmissionAnalysis


class MistakeInline(admin.TabularInline):
    model = Mistake
    extra = 0


@admin.register(SubmissionAnalysis)
class SubmissionAnalysisAdmin(admin.ModelAdmin):
    list_display = ["submission", "created_at"]
    inlines = [MistakeInline]
