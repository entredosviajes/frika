from rest_framework import serializers

from curriculum.models import Exam, ExamQuestion, Exercise, Question, Topic


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ["id", "name", "description"]


class QuestionSerializer(serializers.ModelSerializer):
    topic = TopicSerializer(read_only=True)

    class Meta:
        model = Question
        fields = ["id", "topic", "text", "proficiency_level"]


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ["id", "type", "content", "is_completed", "due_date"]


class ExamQuestionSerializer(serializers.ModelSerializer):
    question = QuestionSerializer(read_only=True)

    class Meta:
        model = ExamQuestion
        fields = ["id", "question", "user_answer", "score", "order"]


class ExamSerializer(serializers.ModelSerializer):
    questions_detail = ExamQuestionSerializer(
        source="examquestion_set", many=True, read_only=True
    )

    class Meta:
        model = Exam
        fields = ["id", "start_date", "end_date", "score", "questions_detail"]
