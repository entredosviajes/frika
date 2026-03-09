import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required

from curriculum.models import Exam, ExamQuestion, Exercise, Question, Topic


class TopicType(DjangoObjectType):
    class Meta:
        model = Topic
        fields = ("id", "name", "description", "created_at", "updated_at")


class QuestionType(DjangoObjectType):
    class Meta:
        model = Question
        fields = ("id", "topic", "text", "proficiency_level", "created_at", "updated_at")


class ExerciseType(DjangoObjectType):
    class Meta:
        model = Exercise
        fields = (
            "id",
            "user",
            "type",
            "content",
            "is_completed",
            "due_date",
            "created_at",
            "updated_at",
        )


class ExamQuestionType(DjangoObjectType):
    class Meta:
        model = ExamQuestion
        fields = (
            "id",
            "exam",
            "question",
            "user_answer",
            "score",
            "order",
            "created_at",
            "updated_at",
        )


class ExamType(DjangoObjectType):
    exam_questions = graphene.List(ExamQuestionType)

    class Meta:
        model = Exam
        fields = (
            "id",
            "user",
            "start_date",
            "end_date",
            "score",
            "created_at",
            "updated_at",
        )

    def resolve_exam_questions(self, info):
        return ExamQuestion.objects.filter(exam=self).select_related("question__topic")


class Query(graphene.ObjectType):
    topics = graphene.List(TopicType)
    questions = graphene.List(QuestionType, topic_id=graphene.ID())
    my_exercises = graphene.List(ExerciseType, due_date=graphene.Date())
    my_exams = graphene.List(ExamType)
    exam = graphene.Field(ExamType, exam_id=graphene.ID(required=True))

    @login_required
    def resolve_topics(self, info):
        return Topic.objects.all()

    @login_required
    def resolve_questions(self, info, topic_id=None):
        qs = Question.objects.select_related("topic")
        if topic_id:
            qs = qs.filter(topic_id=topic_id)
        return qs

    @login_required
    def resolve_my_exercises(self, info, due_date=None):
        qs = Exercise.objects.filter(user=info.context.user).order_by("due_date")
        if due_date:
            qs = qs.filter(due_date=due_date)
        return qs

    @login_required
    def resolve_my_exams(self, info):
        return Exam.objects.filter(user=info.context.user).prefetch_related(
            "examquestion_set__question__topic"
        )

    @login_required
    def resolve_exam(self, info, exam_id):
        return Exam.objects.filter(
            user=info.context.user, id=exam_id
        ).prefetch_related("examquestion_set__question__topic").first()


class CompleteExercise(graphene.Mutation):
    class Arguments:
        exercise_id = graphene.ID(required=True)

    exercise = graphene.Field(ExerciseType)

    @login_required
    def mutate(self, info, exercise_id):
        exercise = Exercise.objects.get(id=exercise_id, user=info.context.user)
        exercise.is_completed = True
        exercise.save()
        return CompleteExercise(exercise=exercise)


class SubmitExamAnswer(graphene.Mutation):
    class Arguments:
        exam_question_id = graphene.ID(required=True)
        answer = graphene.String(required=True)

    exam_question = graphene.Field(ExamQuestionType)

    @login_required
    def mutate(self, info, exam_question_id, answer):
        exam_question = ExamQuestion.objects.select_related("exam").get(
            id=exam_question_id, exam__user=info.context.user
        )
        exam_question.user_answer = answer
        exam_question.save()
        return SubmitExamAnswer(exam_question=exam_question)


class Mutation(graphene.ObjectType):
    complete_exercise = CompleteExercise.Field()
    submit_exam_answer = SubmitExamAnswer.Field()
