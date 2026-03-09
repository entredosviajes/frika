from django.contrib import admin

from progress.models import WeaknessTracker, WeeklyReport


@admin.register(WeaknessTracker)
class WeaknessTrackerAdmin(admin.ModelAdmin):
    list_display = ["user", "tag_name", "error_count", "last_occurrence"]
    list_filter = ["tag_name"]


@admin.register(WeeklyReport)
class WeeklyReportAdmin(admin.ModelAdmin):
    list_display = ["user", "week_start", "week_end", "total_submissions"]
