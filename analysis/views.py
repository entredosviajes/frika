from rest_framework import generics

from analysis.models import SubmissionAnalysis
from analysis.serializers import SubmissionAnalysisSerializer


class AnalysisDetailView(generics.RetrieveAPIView):
    """Get the analysis for a specific submission."""

    serializer_class = SubmissionAnalysisSerializer
    lookup_field = "submission_id"

    def get_queryset(self):
        return SubmissionAnalysis.objects.filter(
            submission__user=self.request.user
        ).prefetch_related("mistakes")
