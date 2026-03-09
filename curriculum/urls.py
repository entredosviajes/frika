from django.urls import path

from curriculum import views

app_name = "curriculum"

urlpatterns = [
    path("topics/", views.TopicListView.as_view(), name="topic-list"),
    path("questions/", views.QuestionListView.as_view(), name="question-list"),
    path("exercises/", views.ExerciseListView.as_view(), name="exercise-list"),
    path("exams/", views.ExamListView.as_view(), name="exam-list"),
    path("exams/<int:pk>/", views.ExamDetailView.as_view(), name="exam-detail"),
]
