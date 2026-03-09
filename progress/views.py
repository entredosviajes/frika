from rest_framework import generics

from progress.models import WeaknessTracker, WeeklyReport
from progress.serializers import WeaknessTrackerSerializer, WeeklyReportSerializer


class WeaknessListView(generics.ListAPIView):
    serializer_class = WeaknessTrackerSerializer

    def get_queryset(self):
        return WeaknessTracker.objects.filter(user=self.request.user).order_by(
            "-error_count"
        )


class WeeklyReportListView(generics.ListAPIView):
    serializer_class = WeeklyReportSerializer

    def get_queryset(self):
        return WeeklyReport.objects.filter(user=self.request.user)


class WeeklyReportDetailView(generics.RetrieveAPIView):
    serializer_class = WeeklyReportSerializer

    def get_queryset(self):
        return WeeklyReport.objects.filter(user=self.request.user)
