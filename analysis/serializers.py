from rest_framework import serializers

from analysis.models import Mistake, SubmissionAnalysis


class MistakeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mistake
        fields = [
            "id",
            "original_text",
            "correction",
            "explanation",
            "category",
            "severity",
        ]


class SubmissionAnalysisSerializer(serializers.ModelSerializer):
    mistakes = MistakeSerializer(many=True, read_only=True)

    class Meta:
        model = SubmissionAnalysis
        fields = [
            "id",
            "submission",
            "raw_transcript",
            "rewritten_version",
            "general_feedback",
            "mistakes",
            "created_at",
        ]
