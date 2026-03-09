from rest_framework import serializers

from submissions.models import DailySubmission


class DailySubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailySubmission
        fields = [
            "id",
            "question",
            "audio_file",
            "recorded_at",
            "duration",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]
