from django.urls import path

from progress import views

app_name = "progress"

urlpatterns = [
    path("weaknesses/", views.WeaknessListView.as_view(), name="weakness-list"),
    path("reports/", views.WeeklyReportListView.as_view(), name="report-list"),
    path("reports/<int:pk>/", views.WeeklyReportDetailView.as_view(), name="report-detail"),
]
