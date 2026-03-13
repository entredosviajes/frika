import os
import uuid

import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required

from submissions.models import DailySubmission

CONVERSATION_STARTERS = [
    "Describe your morning routine today.",
    "Talk about a movie or book you enjoyed recently.",
    "What would you do if you won the lottery?",
    "Describe your favorite place in the world.",
    "Talk about a challenge you overcame.",
    "What are your plans for the weekend?",
    "Describe a meal you love cooking or eating.",
    "Talk about a person who inspires you.",
    "What would you change about your city?",
    "Describe your dream vacation.",
]


class DailySubmissionType(DjangoObjectType):
    duration_seconds = graphene.Int()

    class Meta:
        model = DailySubmission
        fields = (
            "id",
            "user",
            "audio_file",
            "recorded_at",
            "status",
            "created_at",
            "updated_at",
        )

    def resolve_duration_seconds(self, info):
        if self.duration:
            return int(self.duration.total_seconds())
        return None


class Query(graphene.ObjectType):
    my_submissions = graphene.List(DailySubmissionType)
    today_submission = graphene.Field(DailySubmissionType)
    conversation_starters = graphene.List(graphene.String)

    @login_required
    def resolve_my_submissions(self, info):
        return DailySubmission.objects.filter(user=info.context.user)

    @login_required
    def resolve_today_submission(self, info):
        from django.utils import timezone

        today = timezone.now().date()
        return (
            DailySubmission.objects.filter(
                user=info.context.user,
                recorded_at__date=today,
            )
            .order_by("-recorded_at")
            .first()
        )

    def resolve_conversation_starters(self, info):
        import random

        return random.sample(CONVERSATION_STARTERS, min(3, len(CONVERSATION_STARTERS)))


class GeneratePresignedUrl(graphene.Mutation):
    class Arguments:
        filename = graphene.String(required=True)
        content_type = graphene.String(required=True)

    url = graphene.String()
    key = graphene.String()

    @login_required
    def mutate(self, info, filename, content_type):
        ext = os.path.splitext(filename)[1]
        key = f"submissions/audio/{uuid.uuid4().hex}{ext}"

        use_s3 = os.environ.get("USE_S3", "False").lower() in ("true", "1")

        if use_s3:
            import boto3

            bucket = os.environ.get("AWS_STORAGE_BUCKET_NAME", "")
            region = os.environ.get("AWS_S3_REGION_NAME", "us-east-1")
            s3_client = boto3.client("s3", region_name=region)
            presigned_url = s3_client.generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": bucket,
                    "Key": key,
                    "ContentType": content_type,
                },
                ExpiresIn=3600,
            )
            return GeneratePresignedUrl(url=presigned_url, key=key)
        else:
            upload_url = f"http://localhost:8000/upload/{key}"
            return GeneratePresignedUrl(url=upload_url, key=key)


class CreateSubmission(graphene.Mutation):
    class Arguments:
        audio_key = graphene.String(required=True)
        recorded_at = graphene.DateTime(required=True)
        duration = graphene.Int()

    submission = graphene.Field(DailySubmissionType)

    @login_required
    def mutate(self, info, audio_key, recorded_at, duration=None):
        from datetime import timedelta

        from analysis.tasks import process_submission_task

        duration_td = timedelta(seconds=duration) if duration else None
        submission = DailySubmission.objects.create(
            user=info.context.user,
            audio_file=audio_key,
            recorded_at=recorded_at,
            duration=duration_td,
        )
        process_submission_task.delay(submission.id)
        return CreateSubmission(submission=submission)


class RetrySubmission(graphene.Mutation):
    class Arguments:
        submission_id = graphene.ID(required=True)

    submission = graphene.Field(DailySubmissionType)

    @login_required
    def mutate(self, info, submission_id):
        from analysis.tasks import process_submission_task

        submission = DailySubmission.objects.get(
            id=submission_id, user=info.context.user
        )
        if submission.status != DailySubmission.Status.FAILED:
            raise Exception("Only failed submissions can be retried.")

        submission.status = DailySubmission.Status.PENDING
        submission.save(update_fields=["status"])
        process_submission_task.delay(submission.id)
        return RetrySubmission(submission=submission)


class Mutation(graphene.ObjectType):
    generate_presigned_url = GeneratePresignedUrl.Field()
    create_submission = CreateSubmission.Field()
    retry_submission = RetrySubmission.Field()
