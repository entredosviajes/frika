from rest_framework import serializers

from progress.models import WeaknessTracker, WeeklyReport


class WeaknessTrackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeaknessTracker
        fields = ["id", "tag_name", "error_count", "last_occurrence", "resolved_at"]


class WeeklyReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyReport
        fields = [
            "id",
            "week_start",
            "week_end",
            "total_submissions",
            "total_mistakes",
            "top_weaknesses",
            "streak",
            "summary",
        ]
