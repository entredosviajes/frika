import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required

from curriculum.models import Exercise


class ExerciseType(DjangoObjectType):
    feedback = graphene.String()

    class Meta:
        model = Exercise
        fields = (
            "id",
            "user",
            "mistake",
            "type",
            "content",
            "user_answer",
            "is_completed",
            "feedback",
            "created_at",
            "updated_at",
        )


class Query(graphene.ObjectType):
    my_exercises = graphene.List(
        ExerciseType,
        pending_only=graphene.Boolean(),
        submission_id=graphene.ID(),
    )

    @login_required
    def resolve_my_exercises(self, info, pending_only=None, submission_id=None):
        qs = Exercise.objects.filter(user=info.context.user).order_by("-created_at")
        if pending_only:
            qs = qs.filter(is_completed=False)
        if submission_id:
            qs = qs.filter(mistake__analysis__submission_id=submission_id)
        return qs


class SubmitExerciseAnswer(graphene.Mutation):
    class Arguments:
        exercise_id = graphene.ID(required=True)
        answer = graphene.String(required=True)

    exercise = graphene.Field(ExerciseType)

    @login_required
    def mutate(self, info, exercise_id, answer):
        from analysis.services import validate_exercise_answer

        exercise = Exercise.objects.select_related(
            "mistake", "user__profile"
        ).get(id=exercise_id, user=info.context.user)

        feedback = validate_exercise_answer(
            exercise=exercise,
            user_answer=answer,
            target_language=exercise.user.profile.target_language,
        )

        exercise.user_answer = answer
        exercise.is_completed = True
        exercise.feedback = feedback
        exercise.save(update_fields=["user_answer", "is_completed", "feedback"])
        return SubmitExerciseAnswer(exercise=exercise)


class Mutation(graphene.ObjectType):
    submit_exercise_answer = SubmitExerciseAnswer.Field()
