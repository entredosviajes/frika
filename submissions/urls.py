from django.urls import path

from submissions import views

app_name = "submissions"

urlpatterns = [
    path("", views.SubmissionListView.as_view(), name="submission-list"),
    path("upload/", views.SubmissionCreateView.as_view(), name="submission-upload"),
    path("<int:pk>/", views.SubmissionDetailView.as_view(), name="submission-detail"),
]
