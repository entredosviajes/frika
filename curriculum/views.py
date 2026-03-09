from rest_framework import generics

from curriculum.models import Exam, Exercise, Question, Topic
from curriculum.serializers import (
    ExamSerializer,
    ExerciseSerializer,
    QuestionSerializer,
    TopicSerializer,
)


class TopicListView(generics.ListAPIView):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer


class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        qs = Question.objects.select_related("topic")
        topic_id = self.request.query_params.get("topic")
        if topic_id:
            qs = qs.filter(topic_id=topic_id)
        return qs


class ExerciseListView(generics.ListAPIView):
    serializer_class = ExerciseSerializer

    def get_queryset(self):
        return Exercise.objects.filter(user=self.request.user).order_by("due_date")


class ExamListView(generics.ListAPIView):
    serializer_class = ExamSerializer

    def get_queryset(self):
        return Exam.objects.filter(user=self.request.user).prefetch_related(
            "examquestion_set__question__topic"
        )


class ExamDetailView(generics.RetrieveAPIView):
    serializer_class = ExamSerializer

    def get_queryset(self):
        return Exam.objects.filter(user=self.request.user).prefetch_related(
            "examquestion_set__question__topic"
        )
