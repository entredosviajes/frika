import os
import uuid

import graphene
from graphene_django import DjangoObjectType
from graphql_jwt.decorators import login_required

from submissions.models import DailySubmission


class DailySubmissionType(DjangoObjectType):
    class Meta:
        model = DailySubmission
        fields = (
            "id",
            "user",
            "question",
            "audio_file",
            "recorded_at",
            "duration",
            "status",
            "created_at",
            "updated_at",
        )


class Query(graphene.ObjectType):
    my_submissions = graphene.List(DailySubmissionType)

    @login_required
    def resolve_my_submissions(self, info):
        return DailySubmission.objects.filter(user=info.context.user)


class GeneratePresignedUrl(graphene.Mutation):
    class Arguments:
        filename = graphene.String(required=True)
        content_type = graphene.String(required=True)

    url = graphene.String()
    key = graphene.String()

    @login_required
    def mutate(self, info, filename, content_type):
        import boto3

        ext = os.path.splitext(filename)[1]
        key = f"submissions/audio/{uuid.uuid4().hex}{ext}"

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


class CreateSubmission(graphene.Mutation):
    class Arguments:
        question_id = graphene.ID(required=True)
        audio_key = graphene.String(required=True)
        recorded_at = graphene.DateTime(required=True)
        duration = graphene.Int()

    submission = graphene.Field(DailySubmissionType)

    @login_required
    def mutate(self, info, question_id, audio_key, recorded_at, duration=None):
        from datetime import timedelta

        from analysis.tasks import process_submission_task

        duration_td = timedelta(seconds=duration) if duration else None
        submission = DailySubmission.objects.create(
            user=info.context.user,
            question_id=question_id,
            audio_file=audio_key,
            recorded_at=recorded_at,
            duration=duration_td,
        )
        process_submission_task.delay(submission.id)
        return CreateSubmission(submission=submission)


class Mutation(graphene.ObjectType):
    generate_presigned_url = GeneratePresignedUrl.Field()
    create_submission = CreateSubmission.Field()
