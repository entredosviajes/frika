import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required

from analysis.models import Mistake, SubmissionAnalysis


class MistakeType(DjangoObjectType):
    class Meta:
        model = Mistake
        fields = (
            "id",
            "original_text",
            "correction",
            "explanation",
            "category",
            "severity",
            "created_at",
            "updated_at",
        )


class SubmissionAnalysisType(DjangoObjectType):
    mistakes = graphene.List(MistakeType)

    class Meta:
        model = SubmissionAnalysis
        fields = (
            "id",
            "submission",
            "raw_transcript",
            "rewritten_version",
            "general_feedback",
            "created_at",
            "updated_at",
        )

    def resolve_mistakes(self, info):
        return self.mistakes.all()


class Query(graphene.ObjectType):
    submission_analysis = graphene.Field(
        SubmissionAnalysisType,
        submission_id=graphene.ID(required=True),
    )

    @login_required
    def resolve_submission_analysis(self, info, submission_id):
        return (
            SubmissionAnalysis.objects.filter(
                submission_id=submission_id,
                submission__user=info.context.user,
            )
            .prefetch_related("mistakes")
            .first()
        )
