import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required

from progress.models import WeaknessTracker, WeeklyReport


class WeaknessTrackerType(DjangoObjectType):
    class Meta:
        model = WeaknessTracker
        fields = (
            "id",
            "tag_name",
            "error_count",
            "last_occurrence",
            "resolved_at",
            "created_at",
            "updated_at",
        )


class WeeklyReportType(DjangoObjectType):
    class Meta:
        model = WeeklyReport
        fields = (
            "id",
            "week_start",
            "week_end",
            "total_submissions",
            "total_mistakes",
            "top_weaknesses",
            "streak",
            "summary",
            "created_at",
            "updated_at",
        )


class Query(graphene.ObjectType):
    my_weaknesses = graphene.List(WeaknessTrackerType)
    my_reports = graphene.List(WeeklyReportType)

    @login_required
    def resolve_my_weaknesses(self, info):
        return WeaknessTracker.objects.filter(user=info.context.user).order_by(
            "-error_count"
        )

    @login_required
    def resolve_my_reports(self, info):
        return WeeklyReport.objects.filter(user=info.context.user)
