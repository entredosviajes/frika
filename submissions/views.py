from rest_framework import generics

from analysis.tasks import process_submission_task
from submissions.models import DailySubmission
from submissions.serializers import DailySubmissionSerializer


class SubmissionCreateView(generics.CreateAPIView):
    serializer_class = DailySubmissionSerializer

    def perform_create(self, serializer):
        submission = serializer.save(user=self.request.user)
        process_submission_task.delay(submission.id)


class SubmissionListView(generics.ListAPIView):
    serializer_class = DailySubmissionSerializer

    def get_queryset(self):
        return DailySubmission.objects.filter(user=self.request.user)


class SubmissionDetailView(generics.RetrieveAPIView):
    serializer_class = DailySubmissionSerializer

    def get_queryset(self):
        return DailySubmission.objects.filter(user=self.request.user)
