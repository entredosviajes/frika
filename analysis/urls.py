from django.urls import path

from analysis import views

app_name = "analysis"

urlpatterns = [
    path(
        "submission/<int:submission_id>/",
        views.AnalysisDetailView.as_view(),
        name="analysis-detail",
    ),
]
